pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
				dir('build')
				
				{
					sh 'npm install --save-dev javascript-obfuscator'
                    sh 'cp ../buildJenkins/runBuild.js runBuild.js'
                    sh 'cp ../pre.js pre.js'
                    sh 'cp ../post.js post.js'
					sh 'node runBuild.js'
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