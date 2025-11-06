FROM node:22-alpine

RUN apk add --no-cache git vim
ARG	LIBRARYS LIB_FOLDER SHARED_FOLDER TOOLS_PATH_DOCKERFILE

WORKDIR /app
COPY services/gateway .
COPY ${TOOLS_PATH_DOCKERFILE} tools/.
ENV	LIBRARYS=${LIBRARYS}
ENV	SHARED_FOLDER=${SHARED_FOLDER}
RUN chmod +x ./tools/configure_librarys.sh
RUN ./tools/configure_librarys.sh
RUN --mount=type=bind,src=lib,dst=${LIB_FOLDER},rw \
	npm install && npm run build

CMD ["node", "dist/service-bootstrap.js"]

#CMD ["sleep", "infinity"]
