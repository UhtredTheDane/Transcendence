NC = 3#define the number of containers

# **************************************************************************** #
# COLORS

GREEN       = \033[0;32m
GREY        = \033[1;30m
PURPLE      = \033[0;35m
BLUE        = \033[0;94m
CYAN        = \033[0;36m
PINK        = \033[1;35m
RED			= \033[0;31m
DEFAULT		= \033[0;39m

DOCKERCOMPOSE = docker compose -f srcs/docker-compose.yml

# default target
all: up 

# start the biulding process
# create the wordpress and mariadb data directories.
# start the containers in the background and leaves them running
up: build
	@$(DOCKERCOMPOSE) up -d
	@echo "$(BLUE)[Containers]$(DEFAULT) $(NC) containers are up !"

# stop the containers
down: stop
	@$(DOCKERCOMPOSE) down
	@echo "$(RED)[Containers]$(DEFAULT) All containers are down !"

# stop the containers
stop:
	@$(DOCKERCOMPOSE) stop
	@echo "$(RED)[Containers]$(DEFAULT) Stopping all containers..."

# start the containers
start:
	@echo "$(GREEN)[Containers]$(DEFAULT) Launching $(NC) containers..."
	@$(DOCKERCOMPOSE) start

# build the containers
build:
	@echo "$(BLUE)[Containers]$(DEFAULT) Building all containers..."
	@$(DOCKERCOMPOSE) build

# clean the containers
# stop all running containers and remove them.
# remove all images, volumes and networks.
# remove the wordpress and mariadb data directories.
# the (|| true) is used to ignore the error if there are no containers running to prevent the make command from stopping.
clean: down
	@$(DOCKERCOMPOSE) down --rmi all --volumes --remove-orphans
	@echo "$(RED)[Containers]$(DEFAULT) Cleaned !"

fclean: clean
	@docker system prune -f -a --volumes
	@echo "$(RED)[Containers]$(DEFAULT) Fully deleted !"

# fclean: clean
# 	@sudo rm -rf $(DB_DATA) || true
# 	@echo "$(RED)[Containers]$(DEFAULT) Fully cleaned !"

# down, clean and start the containers
re: down clean all

mre: down all

logs:
	@$(DOCKERCOMPOSE) logs --tail=50 --follow --timestamps
