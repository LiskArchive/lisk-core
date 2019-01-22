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
		stage('Delpoy network') {
			steps {
				retry(5) {
					ansiColor('xterm') {
						ansibleTower credential: '', extraVars: """NEWRELIC_ENABLED: '${params.NEWRELIC_ENABLED}'
devnet: ${params.NETWORK}
do_nodes_per_region: ${params.NODES_PER_REGION}
jenkins_ci: 'yes'
lisk_version: ${env.LISK_VERSION}""", importTowerLogs: true, importWorkflowChildLogs: false, inventory: '', jobTags: '', jobTemplate: '46', jobType: 'run', limit: '', removeColor: false, skipJobTags: '', templateType: 'job', throwExceptionWhenFail: true, towerServer: 'tower', verbose: false
					}
				}
			}
		}
		stage('Generate peer config and enable forging') {
			steps {
				retry(5) {
					nvm(getNodejsVersion()) {
						sh '''
						npm run tools:peers:connected
						npm run tools:peers:config
						npm run tools:delegates:enable
						'''
					}
				}
			}
		}
		stage('Test Scenarios') {
			steps {
				retry(2) {
					timestamps {
						nvm(getNodejsVersion()) {
							ansiColor('xterm') {
								sh 'npm run features'
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
							sh 'npm run stress:generic'
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
		cleanup {
			ansiColor('xterm') {
				ansibleTower credential: '',
					extraVars: "do_tag: ${params.NETWORK}_node",
					importTowerLogs: true,
					importWorkflowChildLogs: false,
					inventory: '',
					jobTags: '',
					jobTemplate: '47',
					jobType: 'run',
					limit: '',
					removeColor: false,
					skipJobTags: '',
					templateType: 'job',
					throwExceptionWhenFail: true,
					towerServer: 'tower',
					verbose: false
			}
		}
	}
}
// vim: filetype=groovy
