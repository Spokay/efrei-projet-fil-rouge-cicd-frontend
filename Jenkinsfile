pipeline {
    agent { label 'ssh-agent' }
    environment {
        AZURE_USER = 'azureuser'
        AZURE_VM_HOST = '20.64.169.195'
        IMAGE = 'registry.spokayhub.top/efrei-projet-fil-rouge-cicd-frontend'
        IMAGE_TAG = ''
        PREVIOUS_TAG = ''
    }

    stages {
        stage('Cleanup') {
            steps { cleanWs() }
        }

        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/Spokay/efrei-projet-fil-rouge-cicd-frontend.git'
                script {
                    echo "Commit actuel : ${env.GIT_COMMIT}"
                    echo "Build number : ${env.BUILD_NUMBER}"
                    def shortCommit = env.GIT_COMMIT.take(7)
                    env.IMAGE_TAG = env.BUILD_NUMBER + '-' + shortCommit
                    echo "Image tag: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Build') {
            steps {
                sh '''
                    docker build \
                        -t $IMAGE:$IMAGE_TAG \
                        -t $IMAGE:latest \
                        .
                '''
            }
        }

        stage('Push') {
            steps {
                withDockerRegistry(credentialsId: 'spokay-registry-credentials', url: 'https://registry.spokayhub.top/') {
                    sh '''
                        docker push $IMAGE:$IMAGE_TAG
                        docker push $IMAGE:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(credentials: ['azure-ssh-credentials']) {
                    withCredentials([usernamePassword(credentialsId: 'spokay-registry-credentials', usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS')]) {
                        script {
                            env.PREVIOUS_TAG = sh(
                                script: """
                                    ssh -o StrictHostKeyChecking=no $AZURE_USER@$AZURE_VM_HOST \
                                    "docker inspect fil-rouge-cicd-frontend --format '{{.Config.Image}}' 2>/dev/null || echo 'none'"
                                """,
                                returnStdout: true
                            ).trim()
                            echo "Image actuelle : ${env.PREVIOUS_TAG}"
                            echo "Déploiement de l'image : ${env.IMAGE}:${env.IMAGE_TAG}"
                        }
                        sh '''
                            ssh -o StrictHostKeyChecking=no $AZURE_USER@$AZURE_VM_HOST \
                                "docker login registry.spokayhub.top -u $REGISTRY_USER --password-stdin" \
                                <<< "$REGISTRY_PASS"

                            ssh -o StrictHostKeyChecking=no $AZURE_USER@$AZURE_VM_HOST "
                                docker pull $IMAGE:$IMAGE_TAG &&
                                docker rm -f fil-rouge-cicd-frontend || true &&
                                docker run -d -p 80:80 --name fil-rouge-cicd-frontend $IMAGE:$IMAGE_TAG &&
                                sleep 5 &&
                                docker inspect -f '{{.State.Running}}' fil-rouge-cicd-frontend | grep true
                            "
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Déploiement de l'image ${env.IMAGE}:${env.IMAGE_TAG} réussi"
        }
        failure {
            echo """
                Déploiement échoué
                Image en échec: ${env.IMAGE}:${env.IMAGE_TAG}
                Dernière image fonctionnelle : ${env.PREVIOUS_TAG}
            """
        }
    }
}