FROM node:22-alpine

RUN apk add --no-cache git vim
ARG	LIBRARYS LIB_FOLDER SHARED_FOLDER TOOLS_PATH_DOCKERFILE

WORKDIR /app
COPY services/game .
COPY ${TOOLS_PATH_DOCKERFILE} tools/.
ENV	LIBRARYS=${LIBRARYS}
RUN chmod +x ./tools/configure_librarys.sh
RUN ./tools/configure_librarys.sh
ENV	SHARED_FOLDER=${SHARED_FOLDER}
RUN --mount=type=bind,src=lib,dst=${LIB_FOLDER},rw \
	npm install && npm run build

CMD ["node", "dist/src/service-boostrap.js"]

#CMD ["sleep", "infinity"]
