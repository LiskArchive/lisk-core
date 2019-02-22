@Library('lisk-jenkins') _

properties([
	parameters([
		string(name: 'BRANCH_NAME', defaultValue: 'development', description: 'Lisk core branch name', ),
		string(name: 'NETWORK', defaultValue: 'alphanet', description: 'To Run test against a network', ),
		string(name: 'NODES_PER_REGION', defaultValue: '1', description: 'Number of nodes per region', ),
		string(name: 'STRESS_COUNT', defaultValue: '500', description: 'Number of transactions to create', ), // Used by stage: Test Network Stress
		string(name: 'NEWRELIC_ENABLED', defaultValue: 'no', description: 'Enable NewRelic', ),
	])
])

pipeline {
	agent { node { label 'lisk-core' } }
	options { disableConcurrentBuilds() }
	stages {
		stage('Build') {
			steps {
				nvm(getNodejsVersion()) {
					sh 'npm ci'
				}
			}
		}
		stage('Trigger core build') {
			steps {
				script {
					def b = build job: 'devnet-build-private/development',
					        parameters: [string(name: 'COMMITISH',
							     value: """${params.BRANCH_NAME}"""),
							     booleanParam(name: 'COMMITSHA', value: true),
							     booleanParam(name: 'USE_CACHE', value: true)]
					env.LISK_VERSION = b.getBuildVariables().get('LISK_VERSION')
				}
			}
		}
		stage('Deploy network') {
			steps {
				retry(5) {
					ansiColor('xterm') {
						ansibleTower \
							towerServer: 'tower2',
							templateType: 'job',
							jobTemplate: '14',  // devnet-deploy
							jobType: 'run',
							extraVars: """newrelic_enabled: '${params.NEWRELIC_ENABLED}'
devnet: ${params.NETWORK}
do_nodes_per_region: ${params.NODES_PER_REGION}
jenkins_ci: 'yes'
lisk_version: ${env.LISK_VERSION}""",
							importTowerLogs: true,
							throwExceptionWhenFail: true,
							verbose: false
					}
				}
			}
		}
		stage('Generate peer config and enable forging') {
			steps {
				nvm(getNodejsVersion()) {
					sh '''
					npm run tools:peers:seed:node
					npm run tools:peers:network:nodes
					npm run tools:peers:connected
					npm run tools:delegates:enable
					'''
				}
			}
		}
		stage('Test Scenarios') {
			steps {
				retry(2) {
					timestamps {
						nvm(getNodejsVersion()) {
							ansiColor('xterm') {
								sh 'npm run features || true'
							}
						}
					}
				}
			}
		}
		stage('Test Network Stress') {
			steps {
				timestamps {
					nvm(getNodejsVersion()) {
						ansiColor('xterm') {
							sh 'npm run stress:generic || true'
							sh 'npm run stress:diversified'
						}
					}
				}
			}
		}
	}
	post {
		always {
			allure includeProperties: false, jdk: '', results: [[path: 'output']]
		}
		failure {
			ansibleTower \
				towerServer: 'tower2',
				templateType: 'job',
				jobTemplate: '16',  // devnet-archive-logs
				jobType: 'run',
				extraVars: "devnet: ${params.NETWORK}",
				throwExceptionWhenFail: false,
				verbose: false
		}
		cleanup {
			ansibleTower \
				towerServer: 'tower2',
				templateType: 'job',
				jobTemplate: '15',  // do-destroy-tag
				jobType: 'run',
				extraVars: "do_tag: ${params.NETWORK}_node",
				throwExceptionWhenFail: false,
				verbose: false
		}
	}
}
// vim: filetype=groovy
