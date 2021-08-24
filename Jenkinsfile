pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
				dir('build'){
					sh 'npm install --save-dev javascript-obfuscator'
					sh 'node ../buildJenkins/runBuild.js'
					sh 'zip -9 -r BrickFlowerLib.zip ./'
					archiveArtifacts artifacts: '*.zip', fingerprint: true

                    deleteDir()
				}
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
            }
        }
    }
}