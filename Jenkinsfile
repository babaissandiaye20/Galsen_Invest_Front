pipeline {
    agent any

    environment {
        // Docker Hub
        DOCKERHUB_USERNAME = 'zigfreak'
        IMAGE_NAME         = 'front.galsen-invest'

        // VPS SSH
        VPS_HOST       = '38.242.253.46'
        CONTAINER_NAME = 'galsen-frontend'
        CONTAINER_PORT = '8080'
        HOST_PORT      = '3000'

        // Build version
        BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'latest'}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // ============================================
        // STAGE 1: Checkout
        // ============================================
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    env.BUILD_VERSION = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                    echo "Build version: ${env.BUILD_VERSION}"
                }
            }
        }

        // ============================================
        // STAGE 2: Build Docker Image
        // ============================================
        stage('Build Docker Image') {
            steps {
                sh """
                    DOCKER_BUILDKIT=1 docker build \
                        -t ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${BUILD_VERSION} \
                        -t ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest \
                        .
                """
            }
        }

        // ============================================
        // STAGE 3: Trivy Security Scan
        // ============================================
        stage('Trivy Image Scan') {
            steps {
                script {
                    sh 'mkdir -p trivy-reports'

                    sh """
                        trivy image \
                            --format json \
                            --output trivy-reports/${IMAGE_NAME}.json \
                            --severity HIGH,CRITICAL \
                            --no-progress \
                            ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${BUILD_VERSION} || true
                    """

                    def rc = sh(
                        script: """
                            trivy image \
                                --exit-code 1 \
                                --severity CRITICAL \
                                --no-progress \
                                --ignore-unfixed \
                                ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${BUILD_VERSION}
                        """,
                        returnStatus: true
                    )
                    if (rc != 0) {
                        echo "TRIVY: CVE CRITICAL trouvees dans ${IMAGE_NAME}"
                    } else {
                        echo "TRIVY: Aucune CVE CRITICAL non-fixee"
                    }
                }
            }
            post {
                always {
                    archiveArtifacts allowEmptyArchive: true, artifacts: 'trivy-reports/*'
                }
            }
        }

        // ============================================
        // STAGE 4: Push to Docker Hub
        // ============================================
        stage('Push to Docker Hub') {
            when {
                expression {
                    def b = env.GIT_BRANCH ?: env.BRANCH_NAME ?: ''
                    return b.contains('main') || b.contains('develop')
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    '''
                    sh "docker push ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${BUILD_VERSION}"
                    sh "docker push ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest"
                    sh 'docker logout'
                }
            }
        }

        // ============================================
        // STAGE 5: Deploy to VPS via SSH
        // ============================================
        stage('Deploy to VPS') {
            when {
                expression {
                    def b = env.GIT_BRANCH ?: env.BRANCH_NAME ?: ''
                    return b.contains('main') || b.contains('develop')
                }
            }
            steps {
                script {
                    def b = env.GIT_BRANCH ?: env.BRANCH_NAME ?: ''
                    if (b.contains('main')) {
                        timeout(time: 10, unit: 'MINUTES') {
                            input message: 'Deployer le FRONTEND en production ?', ok: 'Deployer'
                        }
                    }
                }
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'vps-deploy',
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER'
                )]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i \$SSH_KEY \$SSH_USER@${VPS_HOST} '
                            set -e

                            echo ">>> Sauvegarde image actuelle (rollback)..."
                            docker tag ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:rollback 2>/dev/null || true

                            echo ">>> Pull nouvelle image..."
                            docker pull ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest

                            echo ">>> Arret ancien container..."
                            docker stop ${CONTAINER_NAME} 2>/dev/null || true
                            docker rm ${CONTAINER_NAME} 2>/dev/null || true

                            echo ">>> Demarrage nouveau container..."
                            docker run -d \
                                --name ${CONTAINER_NAME} \
                                --restart unless-stopped \
                                -p ${HOST_PORT}:${CONTAINER_PORT} \
                                ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest

                            echo ">>> Nettoyage images anciennes..."
                            # Supprimer toutes les images versionnees sauf latest et rollback
                            docker images --format "{{.Repository}}:{{.Tag}}" \
                                | grep "^${DOCKERHUB_USERNAME}/${IMAGE_NAME}:" \
                                | grep -v ":latest$" \
                                | grep -v ":rollback$" \
                                | xargs -r docker rmi 2>/dev/null || true

                            # Supprimer les images dangling et le cache
                            docker image prune -af --filter "until=1h"
                            docker builder prune -f 2>/dev/null || true

                            echo ">>> Espace disque apres nettoyage:"
                            docker system df

                            echo ">>> Container actif:"
                            docker ps --filter name=${CONTAINER_NAME}
                        '
                    """
                }
            }
        }

        // ============================================
        // STAGE 6: Health Check + Rollback auto
        // ============================================
        stage('Health Check') {
            when {
                expression {
                    def b = env.GIT_BRANCH ?: env.BRANCH_NAME ?: ''
                    return b.contains('main') || b.contains('develop')
                }
            }
            steps {
                sleep(time: 15, unit: 'SECONDS')
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'vps-deploy',
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER'
                )]) {
                    script {
                        def healthResult = sh(
                            script: """
                                ssh -o StrictHostKeyChecking=no -i \$SSH_KEY \$SSH_USER@${VPS_HOST} '
                                    curl -sf http://localhost:${HOST_PORT}/ > /dev/null && echo "Frontend OK" || exit 1
                                '
                            """,
                            returnStatus: true
                        )

                        if (healthResult != 0) {
                            echo "HEALTH CHECK ECHOUE — ROLLBACK EN COURS..."

                            sh """
                                ssh -o StrictHostKeyChecking=no -i \$SSH_KEY \$SSH_USER@${VPS_HOST} '
                                    echo ">>> ROLLBACK: Restauration image precedente..."
                                    docker stop ${CONTAINER_NAME} 2>/dev/null || true
                                    docker rm ${CONTAINER_NAME} 2>/dev/null || true

                                    docker tag ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:rollback ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest 2>/dev/null || true

                                    docker run -d \
                                        --name ${CONTAINER_NAME} \
                                        --restart unless-stopped \
                                        -p ${HOST_PORT}:${CONTAINER_PORT} \
                                        ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest

                                    echo ">>> ROLLBACK: Container restaure:"
                                    docker ps --filter name=${CONTAINER_NAME}
                                '
                            """

                            error("Health check echoue. Rollback effectue.")
                        } else {
                            echo "Frontend est UP et accessible"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "FRONTEND ${BUILD_VERSION} DEPLOYE AVEC SUCCES sur ${VPS_HOST}"
            sh """
                echo ">>> Nettoyage images locales (Jenkins)..."
                # Supprimer toutes les images versionnees locales sauf latest et rollback
                docker images --format '{{.Repository}}:{{.Tag}}' \
                    | grep '^${DOCKERHUB_USERNAME}/${IMAGE_NAME}:' \
                    | grep -v ':latest\$' \
                    | grep -v ':rollback\$' \
                    | xargs -r docker rmi 2>/dev/null || true

                # Nettoyer les images dangling locales
                docker image prune -f
            """
        }
        failure {
            echo "ECHEC DU BUILD FRONTEND ${BUILD_VERSION}"
        }
        always {
            cleanWs()
        }
    }
}
