#!/bin/sh

HRED="\033[91m"
HGRE="\033[92m"
HYEL="\033[93m"
HMAG="\033[95m"
HCYA="\033[96m"
RST="\033[0m"

#--- Game Script -----------------------------------------------------------

ft_update_share_lib()
{
	if [[ -z ${LIBRARYS} ]];
	then
		return 1;
	fi
	for library in ${LIBRARYS}; do
		echo -e "${HMAG}Updating lib path dependecies${RST}"
		sed -i "s|../../lib/$library|file:/segfaultx/lib/$library|g" ./package-lock.json
		sed -i "s|../../lib/$library|file:/segfaultx/lib/$library|g" ./package.json
	done
}

ft_update_share_lib
