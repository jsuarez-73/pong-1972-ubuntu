#------------------------------------------------------------------------------#
#	RECIPES FOR BUILD ---
#------------------------------------------------------------------------------#

build-gateway:
	@echo -e "$(HBLU)\nBuilding gateway...$(RST)"
	@$(DOCKER_COMPOSE) build gateway

build-oauth:
	@echo -e "$(HBLU)\nBuilding oauth...$(RST)"
	@$(DOCKER_COMPOSE) build oauth

build-game:
	@echo -e "$(HBLU)\nBuilding game...$(RST)"
	@$(DOCKER_COMPOSE) build game

build-web:
	@echo -e "$(HBLU)\nBuilding web...$(RST)"
	@$(DOCKER_COMPOSE) build web

#------------------------------------------------------------------------------#
#   SPEC                                                                       #
#------------------------------------------------------------------------------#

.PHONY:	build-gateway build-oauth build-game build-web
