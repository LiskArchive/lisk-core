pipeline {
    agent { node { label 'lisk-build' } }
    stages {
        stage('parallel') {
            parallel {
                stage('Docker build') {
                        agent { node { label 'docker' } }
                        steps {
                                git credentialsId: 'liskjenkins-pac', url: 'https://github.com/LiskHQ/lisk-core', branch: 'fix-build'
                                sh 'docker build -t=lisk/core .'
                        }
                }
                stage('Binary build') {
                    steps {
                        dir('build') {
                            sh 'make LISK_NETWORK=testnet'
                        }
                    }
                }
            }
        }
    }
}
// vim: filetype=groovy
