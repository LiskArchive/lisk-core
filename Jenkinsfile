@Library('lisk-jenkins') _

properties([
  parameters([
    string(name: 'STRESS_COUNT', defaultValue: 1000, description: 'Number of transactions to create', ),
    string(name: 'NETWORK', defaultValue: 'alphanet', description: 'To Run test against a network', ),
  ])
])

pipeline {
  agent { node { label 'lisk-core' } }
  stages {
    stage ('Build') {
      steps {
        ansiColor('xterm') {
          timestamps {
            nvm(getNodejsVersion()) {
              sh 'npm ci'
            }
          }
        }
      }
    }
  }
}
