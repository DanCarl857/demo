# Docker Compose targets
up:
	docker-compose up --build

down:
	docker-compose down

restart:
	docker-compose down && docker-compose up --build

logs:
	docker-compose logs -f

# Individual services
backend:
	docker-compose up --build backend

frontend:
	docker-compose up --build frontend

mongo:
	docker-compose up --build mongo

redis:
	docker-compose up --build redis

# Stop individual services
stop-backend:
	docker-compose stop backend

stop-frontend:
	docker-compose stop frontend

stop-mongo:
	docker-compose stop mongo

stop-redis:
	docker-compose stop redis

# Clean volumes and images
clean:
	docker-compose down -v --rmi all --remove-orphans
