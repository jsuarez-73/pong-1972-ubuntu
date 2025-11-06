FROM node:22-alpine

RUN apk add --no-cache git vim
ARG SHARED_FOLDER

WORKDIR /app
COPY web .
ENV	SHARED_FOLDER=${SHARED_FOLDER}
RUN npm install
RUN npx ng analytics off
RUN npx ng build --configuration=production

#CMD ["npx","ng", "serve", "--host", "segfaultx.com", "--port", "4200"]
#CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
CMD ["npm", "run", "serve:ssr:web"]

#CMD ["sleep", "infinity"]
