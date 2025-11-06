#------------------------------------------------------------------------------#
#	RECIPES FOR DOWN ---
#------------------------------------------------------------------------------#

down-gateway:
	@echo -e "$(HBLU)\nStopping  gateway...$(RST)"
	@$(DOCKER_COMPOSE) down gateway
	@$(DOCKER_COMPOSE) rm -f gateway

down-oauth:
	@echo -e "$(HBLU)\nStopping  oauth...$(RST)"
	@$(DOCKER_COMPOSE) down oauth
	@$(DOCKER_COMPOSE) rm -f oauth

down-game:
	@echo -e "$(HBLU)\nStopping  game...$(RST)"
	@$(DOCKER_COMPOSE) down game
	@$(DOCKER_COMPOSE) rm -f game

down-web:
	@echo -e "$(HBLU)\nStopping  web...$(RST)"
	@$(DOCKER_COMPOSE) down web
	@$(DOCKER_COMPOSE) rm -f web

#------------------------------------------------------------------------------#
#   SPEC                                                                       #
#------------------------------------------------------------------------------#

.PHONY:	down-gateway down-oauth down-game down-web
