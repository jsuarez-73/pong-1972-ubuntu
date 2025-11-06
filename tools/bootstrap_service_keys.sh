#!/bin/sh

HRED="\033[91m";
HGRE="\033[92m";
HYEL="\033[93m";
HMAG="\033[95m";
HCYA="\033[96m";
RST="\033[0m";
#[PENDING]: Check if it's better set this in Dockerfile for every client
#during build time, but remember that node_modules must be built before,
#execute this shell scipts due to public_key in jwk format dependency.
ROOT="./";
FOLDER="./assets/";
PREFIX="cli";
SCRIPTS_FOLDER="${ROOT}/dist/";

ft_createPairKeys () {
	KEY_FOLDER="${FOLDER}/keys";
	mkdir -p $KEY_FOLDER;
	if [ -r ${KEY_FOLDER}/${PREFIX}_rsa.priv -a -r ${KEY_FOLDER}/${PREFIX}_rsa.pub ];
	then
		echo "${HGRE}Public and Private keys already exists${RST}";
		return 0;
	fi
	if [ ! -r ${KEY_FOLDER}/${PREFIX}_rsa.priv ];
	then
		openssl genrsa -out ${KEY_FOLDER}/${PREFIX}_rsa.priv;
		openssl rsa -pubout -out ${KEY_FOLDER}/${PREFIX}_rsa.pub -in \
			${KEY_FOLDER}/${PREFIX}_rsa.priv;
		echo "${HGRE}Public and PRivate keys created successfully.${RST}";
		return 0;
	fi
	if [ ! -r ${KEY_FOLDER}/${PREFIX}_rsa.pub ];
	then
		openssl rsa -pubout -out ${KEY_FOLDER}/${PREFIX}_rsa.pub -in \
			${KEY_FOLDER}/${PREFIX}_rsa.priv;
		echo "${HYEL}Public keys created successfully, Private already exists.${RST}";
		return 0;
	fi
	return 1;
}

ft_boostrap_cli () {
	if ( ft_createPairKeys && node "${SCRIPTS_FOLDER}/build/build.js" );
	then
		echo "${HGRE}Cli built correctly${RST}";
	else
		echo "${HRED}Cli failed building${RST}";
	fi

}

ft_boostrap_cli;
