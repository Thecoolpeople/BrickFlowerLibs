pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'rm build/*'
                dir('buildJenkins')
                {
                    sh 'npm install javascript-obfuscator'
                    sh 'zip -9 -r BrickFlowerLib.zip ../build/'
                    archiveArtifacts artifacts: '*.zip', fingerprint: true
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