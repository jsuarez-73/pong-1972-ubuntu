#------------------------------------------------------------------------------#
#	RECIPES FOR UP ---
#------------------------------------------------------------------------------#

up-gateway:
	@echo -e "$(HBLU)\nStarting  gateway...$(RST)"
	@$(DOCKER_COMPOSE) up -d gateway

up-oauth:
	@echo -e "$(HBLU)\nStarting  oauth...$(RST)"
	@$(DOCKER_COMPOSE) up -d oauth

up-game:
	@echo -e "$(HBLU)\nStarting  game...$(RST)"
	@$(DOCKER_COMPOSE) up -d game

up-web:
	@echo -e "$(HBLU)\nStarting  web...$(RST)"
	@$(DOCKER_COMPOSE) up -d web

#------------------------------------------------------------------------------#
#   SPEC                                                                       #
#------------------------------------------------------------------------------#

.PHONY:	up-gateway up-oauth up-game up-web
