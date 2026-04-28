pipeline {
    agent { label 'ssh-agent' }
    tools {
        nodejs 'node-25'
    }
    environment {
        AZURE_USER = 'azureuser'
        AZURE_VM_HOST = '20.51.114.37'
        IMAGE = 'registry.spokayhub.top/efrei-projet-fil-rouge-cicd-frontend'
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

        stage('Test') {
            steps {
                sh '''
                    npm ci
                    CI=true npm test -- --watchAll=false --coverage
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('sonar-spokay') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build') {
            steps {
                sh '''
                    docker build \
                        --platform linux/arm64 \
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
                sshagent(credentials: ['azure-ssh-frontend-credentials']) {
                    withCredentials([
                        usernamePassword(credentialsId: 'spokay-registry-credentials', usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS'),
                        file(credentialsId: 'fil-rouge-cicd-frontend-env', variable: 'ENV_FILE')
                    ]) {
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
                            echo "$REGISTRY_PASS" | ssh -o StrictHostKeyChecking=no $AZURE_USER@$AZURE_VM_HOST \
                                "docker login registry.spokayhub.top -u $REGISTRY_USER --password-stdin"

                            scp -o StrictHostKeyChecking=no $ENV_FILE $AZURE_USER@$AZURE_VM_HOST:/home/$AZURE_USER/fil-rouge-cicd-frontend.env
                            scp -o StrictHostKeyChecking=no docker-compose.stg.yml $AZURE_USER@$AZURE_VM_HOST:/home/$AZURE_USER/docker-compose.stg.yml

                            ssh -o StrictHostKeyChecking=no $AZURE_USER@$AZURE_VM_HOST "
                                cd /home/$AZURE_USER &&
                                IMAGE_TAG=$IMAGE_TAG docker compose -f docker-compose.stg.yml pull &&
                                IMAGE_TAG=$IMAGE_TAG docker compose -f docker-compose.stg.yml up -d &&
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