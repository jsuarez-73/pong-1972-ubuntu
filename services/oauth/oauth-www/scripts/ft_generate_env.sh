#!/bin/sh

#In case you want to use this script instead of node, just change in
#package.json prebuild and prebuild-dev and also modify each occurrences of
#those constants, By default is used #the node script because provide a versatil
#way to add more constants up as needed#Unlike this implementation which is more
#complicated to set up.

function ft_generate_env () {
	echo "export const	CONSTANTS = {\n"\
		"OAUTH_PORT: ${OAUTH_PORT:-3001},\n"\
		"OAUTH_HOST: \"${OAUTH_HOSTNAME:-'localhost'}\",\n"\
		"CLIENT_ID: \"${CLIENT_ID:-409116011161-ebf5blfces8od3vkiao4tuan8dk3qb4b.apps.googleusercontent.com}\",\n"\
		"API_VERSION: \"v1\",\n"\
	"}\n"\
	"export const	DOMAINS = {\n"\
		'OAUTH_DOMAIN: `${CONSTANTS.OAUTH_HOST}:${CONSTANTS.OAUTH_PORT}`'"\n"\
	"}\n"\
	"export const	SERVICES = {\n"\
		'signin: `${DOMAINS.OAUTH_DOMAIN}/${CONSTANTS.API_VERSION}/signin`,'"\n"\
		'access: `${DOMAINS.OAUTH_DOMAIN}/${CONSTANTS.API_VERSION}/access`,'"\n"\
		'callback: `${DOMAINS.OAUTH_DOMAIN}/${CONSTANTS.API_VERSION}/callback`,'"\n"\
	"}\n" > src/app/constants/constants.g.ts;
}

ft_generate_env
