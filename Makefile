NAME = transcendence

all: up 
	
up:
	docker compose -f srcs/docker-compose.yml up --build
start:
	docker compose -f srcs/docker-compose.yml start
stop:
	docker compose -f srcs/docker-compose.yml stop
down:
	docker compose -f ./srcs/docker-compose.yml down
clean:
	docker compose -f ./srcs/docker-compose.yml down --rmi all --volumes --remove-orphans

fclean: clean
	docker system prune -f -a --volumes

.PHONY: all stop start down re clean fclean