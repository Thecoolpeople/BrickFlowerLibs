pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
				dir('buildJenkins')
				
				{
					sh 'npm install javascript-obfuscator'
					sh 'zip -9 -r BrickFlowerLib.zip ../build/'
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