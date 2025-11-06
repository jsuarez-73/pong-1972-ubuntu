#------------------------------------------------------------------------------#
#   ART                                                                        #
#------------------------------------------------------------------------------#

define ART
$(HGRE)
	|¯¯|¯¯¯¯|¯|¯¯\\
	|$(RST)^$(HGRE) |____|_|  |
	|            |
	|  ________  |
	| |$(RST)sfx$(HGRE)     | |
	| |        | |
	|_|________|_|
$(RST)

endef
export ART
include services/services.env

#------------------------------------------------------------------------------#
#   INGREDIENTS                                                                #
#------------------------------------------------------------------------------#

ENV_FILE=services/services.env

COMPOSE_FILES=-f ./compose.yaml -f ./compose.override.yaml

DOCKER_COMPOSE=docker compose --env-file $(ENV_FILE) $(COMPOSE_FILES)

MAKE_PATH=make/

#------------------------------------------------------------------------------#
#   UTENSILS                                                                   #
#------------------------------------------------------------------------------#

#------------------------------------------------------------------------------#
#   RECIPES                                                                    #
#------------------------------------------------------------------------------#

all: prepare build up
	@echo -e "$(HRED)\nProviding low-level memory access...$(RST)" && sleep 1
	@echo -e "$$ART"

prepare	:
	@echo -e "$(HBLU)Preraring the memory...$(RST)"
	@for library in $(subst ",,$(LIBRARYS)); do\
		npm --prefix ./lib/$$library install ./lib/$$library;\
	done
# This validation allow to populate the shared directory with the 
# private/public keys to be used by the services in client registration.
	@if [ -n "$$(ls shared/* 2>/dev/null)" ]; then\
		echo -e "$(HYEL)Shared directory already populated $(RST)";\
	else\
		mkdir -p shared;\
		openssl genrsa -out shared/segfaultx_service.priv;\
		openssl rsa -pubout -out shared/segfaultx_service.pub -in shared/segfaultx_service.priv;\
		openssl x509 -new -subj "/CN=segfaultx/"\
			-key "shared/segfaultx_service.priv"\
			-out "shared/segfaultx_service.cert.pem";\
		echo -e "$(HGRE)Shared directory populated $(RST)";\
	fi

build:
	@echo -e "$(HBLU)\nBuilding gateway...$(RST)"
	@$(DOCKER_COMPOSE) build gateway
	@echo -e "$(HBLU)\nBuilding oauth...$(RST)"
	@$(DOCKER_COMPOSE) build oauth
	@echo -e "$(HBLU)\nBuilding game...$(RST)"
	@$(DOCKER_COMPOSE) build game
	@echo -e "$(HBLU)\nBuilding web...$(RST)"
	@$(DOCKER_COMPOSE) build web

include $(MAKE_PATH)docker-build.mk

up:
	@echo -e "$(HGRE)Starting containers...$(RST)"
	@$(DOCKER_COMPOSE) up -d

include $(MAKE_PATH)docker-up.mk

down:
	@echo -e "$(HBLU)Stopping containers...$(RST)"
	@$(DOCKER_COMPOSE) down

include $(MAKE_PATH)docker-down.mk

clean:
	@for library in $(subst ",,$(LIBRARYS)); do\
		rm -rf lib/$$library/{dist,node_modules};\
	done
	@if [ -n "$$(docker ps -qa)" ]; then\
		docker stop $$(docker ps -qa); \
		docker rm $$(docker ps -qa); \
	else\
		echo -e "$(HMAG)No running containers to stop or remove.$(RST)";\
	fi
	@if [ -n "$$(docker image ls -q)" ]; then\
		docker rmi -f $$(docker image ls -q);\
	else\
		echo -e "$(HMAG)No images to remove.$(RST)";\
	fi
	@if [ -n "$$(docker volume ls -q)" ]; then\
		docker volume rm $$(docker volume ls -q);\
	else\
		echo -e "$(HMAG)No volumes to remove.$(RST)";\
	fi
	@if [ -n "$$(docker network ls --filter type=custom -q)" ]; then\
		docker network rm $$(docker network ls --filter type=custom -q);\
	else\
		echo -e "$(HMAG)No networks to remove.$(RST)";\
	fi
	@docker system prune --all --volumes -f

fclean: down clean
	rm -rf shared

#------------------------------------------------------------------------------#
#   SPEC                                                                       #
#------------------------------------------------------------------------------#

.PHONY:	all clean fclean prepare build up down

#------------------------------------------------------------------------------#
#   COLORS                                                                     #
#------------------------------------------------------------------------------#

RST:=	\033[0m
RED:=	\033[31m
GRE:=	\033[32m
BLU:=	\033[34m
CYA:=	\033[36m

HRED:=	\033[91m
HGRE:=	\033[92m
HYEL:=	\033[93m
HBLU:=	\033[94m
HMAG:=	\033[95m
HCYA:=	\033[96m
HWHI:=	\033[97m

#********************************************************************* END ****#
