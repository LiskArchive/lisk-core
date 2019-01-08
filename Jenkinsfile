@Library('lisk-jenkins') _

properties([
	parameters([
		string(name: 'STRESS_COUNT', defaultValue: '1000', description: 'Number of transactions to create', ),
		string(name: 'NETWORK', defaultValue: 'alphanet', description: 'To Run test against a network', ),
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
				build job: 'devnet-build-private/development',
				      parameters: [string(name: 'COMMITISH',
				                   value: 'development'),
				                   booleanParam(name: 'COMMITSHA', value: true),
				                   booleanParam(name: 'USE_CACHE', value: true)]
			}
		}
		stage('Delpoy network') {
			steps {
				retry(5) {
					ansiColor('xterm') {
						// TODO: get lisk_version dynamically
						ansibleTower credential: '', extraVars: """NEWRELIC_ENABLED: '${params.NEWRELIC_ENABLED}'
devnet: ${params.NETWORK}
do_nodes_per_region: 1
jenkins_ci: 'yes'
lisk_version: 1.4.0-rc.0""", importTowerLogs: true, importWorkflowChildLogs: false, inventory: '', jobTags: '', jobTemplate: '46', jobType: 'run', limit: '', removeColor: false, skipJobTags: '', templateType: 'job', throwExceptionWhenFail: true, towerServer: 'tower', verbose: false
					}
				}
			}
		}
		stage('Generate peer config and enable forging') {
			steps {
				nvm(getNodejsVersion()) {
					sh '''
					npm run tools:peers:config
					npm run tools:delegates:enable
					'''
				}
			}
		}
		stage('Test Scenarios') {
			steps {
				timestamps {
					nvm(getNodejsVersion()) {
						ansiColor('xterm') {
							sh 'npm run features'
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
							sh 'npm run stress'
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
