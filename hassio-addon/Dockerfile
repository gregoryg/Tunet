ARG BUILD_FROM
FROM $BUILD_FROM

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

COPY hassio-addon/run.sh /run.sh
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
