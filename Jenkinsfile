@Library('lisk-jenkins') _

def generate_peer_list() {
  ansiColor('xterm') {
    timestamps {
      nvm(getNodejsVersion()) {
        sh 'npm run tools:peer:config'
      }
    }
  }
}

def enable_or_disable_forging(flag) {
  ansiColor('xterm') {
    timestamps {
      nvm(getNodejsVersion()) {
        if (flag === true) {
          sh 'npm run tools:delegates:enable'
        } else {
          sh 'npm run tools:delegates:disable'
        }
      }
    }
  }
}

def run_feature_test() {
  ansiColor('xterm') {
    timestamps {
      nvm(getNodejsVersion()) {
        sh 'npm run features'
      }
    }
  }
}

def run_stress_test() {
  ansiColor('xterm') {
    timestamps {
      nvm(getNodejsVersion()) {
        sh 'STRESS_COUNT=1000 NETWORK=alphanet npm run stress'
      }
    }
  }
}

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
