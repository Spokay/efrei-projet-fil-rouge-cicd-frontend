pipeline {
    agent { label 'ssh-agent' }
    tools {
        nodejs 'node-20'
    }
    parameters {
        choice(name: 'DEPLOY_ENV', choices: ['stg', 'prod'], description: 'Environnement cible')
        string(name: 'REGISTRY', defaultValue: 'registry.spokayhub.top', description: 'URL du registry Docker')
        string(name: 'GIT_URL', defaultValue: 'https://github.com/Spokay/efrei-projet-fil-rouge-cicd-frontend.git', description: 'URL du dépôt Git')
        string(name: 'GIT_BRANCH', defaultValue: 'master', description: 'Branche à builder')
        string(name: 'TARGET_PLATFORM', defaultValue: 'linux/amd64', description: 'Plateforme Docker build')
        string(name: 'VM_HOST', defaultValue: '172.179.237.62', description: 'IP ou hostname de la VM cible')
        string(name: 'VM_USER', defaultValue: 'azureuser', description: 'Utilisateur SSH sur la VM cible')
    }
    environment {
        IMAGE_NAME     = 'efrei-projet-fil-rouge-cicd-frontend'
        IMAGE          = "${params.REGISTRY}/${IMAGE_NAME}"
        COMPOSE_FILE   = "docker-compose.${params.DEPLOY_ENV}.yml"
        CONTAINER_NAME = "${IMAGE_NAME}-${params.DEPLOY_ENV}"
    }

    stages {
        stage('Cleanup') {
            steps { cleanWs() }
        }

        stage('Checkout') {
            steps {
                git branch: params.GIT_BRANCH, url: params.GIT_URL
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
                sh """
                    docker build \\
                        --platform ${params.TARGET_PLATFORM} \\
                        -t $IMAGE:$IMAGE_TAG \\
                        -t $IMAGE:latest \\
                        .
                """
            }
        }

        stage('Push') {
            steps {
                withDockerRegistry(credentialsId: 'registry-credentials', url: "https://${params.REGISTRY}/") {
                    sh '''
                        docker push $IMAGE:$IMAGE_TAG
                        docker push $IMAGE:latest
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(credentials: ["frontend-${params.DEPLOY_ENV}-ssh-credentials"]) {
                    withCredentials([
                        usernamePassword(credentialsId: 'registry-credentials', usernameVariable: 'REGISTRY_USER', passwordVariable: 'REGISTRY_PASS'),
                        file(credentialsId: "frontend-${params.DEPLOY_ENV}-env", variable: 'ENV_FILE')
                    ]) {
                        script {
                            env.VM_HOST = params.VM_HOST
                            env.VM_USER = params.VM_USER
                            env.PREVIOUS_TAG = sh(
                                script: """
                                    ssh -o StrictHostKeyChecking=no $VM_USER@$VM_HOST \
                                    "docker inspect $CONTAINER_NAME --format '{{.Config.Image}}' 2>/dev/null || echo 'none'"
                                """,
                                returnStdout: true
                            ).trim()
                            echo "Image actuelle : ${env.PREVIOUS_TAG}"
                            echo "Déploiement de l'image : ${env.IMAGE}:${env.IMAGE_TAG}"
                        }
                        sh '''
                            echo "$REGISTRY_PASS" | ssh -o StrictHostKeyChecking=no $VM_USER@$VM_HOST \
                                "docker login $REGISTRY -u $REGISTRY_USER --password-stdin"

                            ssh -o StrictHostKeyChecking=no $VM_USER@$VM_HOST "mkdir -p ~/.deploy && rm -f ~/.deploy/frontend-${DEPLOY_ENV}.env"

                            scp -o StrictHostKeyChecking=no $ENV_FILE $VM_USER@$VM_HOST:~/.deploy/frontend-${DEPLOY_ENV}.env
                            scp -o StrictHostKeyChecking=no $COMPOSE_FILE $VM_USER@$VM_HOST:~/.deploy/$COMPOSE_FILE

                            ssh -o StrictHostKeyChecking=no $VM_USER@$VM_HOST "
                                cd ~/.deploy &&
                                IMAGE_TAG=$IMAGE_TAG docker compose -f $COMPOSE_FILE pull &&
                                IMAGE_TAG=$IMAGE_TAG docker compose -f $COMPOSE_FILE up -d --force-recreate --remove-orphans &&
                                sleep 5 &&
                                docker inspect -f '{{.State.Running}}' $CONTAINER_NAME | grep true
                            "
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Déploiement [${params.DEPLOY_ENV}] de l'image ${env.IMAGE}:${env.IMAGE_TAG} réussi"
        }
        failure {
            echo """
                Déploiement [${params.DEPLOY_ENV}] échoué
                Image en échec: ${env.IMAGE}:${env.IMAGE_TAG}
                Dernière image fonctionnelle : ${env.PREVIOUS_TAG}
            """
        }
    }
}