@Library('lisk-jenkins') _

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
