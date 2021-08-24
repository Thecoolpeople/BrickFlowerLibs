pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
				dir('/buildJenkins'){
					sh 'npm install --save-dev javascript-obfuscator'
					sh 'node runBuild.js'
					sh 'zip -9 -r --exclude=runBuild.js BrickFlowerLib.zip ./'
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