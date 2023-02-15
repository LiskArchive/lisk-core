ARG NODEJS_VERSION=16

##### Stage 1

FROM node:$NODEJS_VERSION-alpine AS builder

RUN apk add --no-cache alpine-sdk python3 libtool autoconf automake rust cargo cmake clang15-libs clang15-dev clang15 rustfmt linux-headers && \
    adduser -D lisk && \
    mkdir /home/lisk/build && \
    chown -R lisk:lisk /home/lisk/ && \
    npm install -g npm

USER lisk
WORKDIR /home/lisk/build

COPY ./package-lock.json ./package.json ./.npmrc ./
RUN npm ci


##### Stage 2

FROM node:$NODEJS_VERSION-alpine

RUN adduser -D lisk && \
    mkdir /home/lisk/.lisk && \
    chown -R lisk:lisk /home/lisk/ && \
    npm install -g npm

USER lisk
WORKDIR /home/lisk
VOLUME ["/home/lisk/.lisk"]

COPY --chown=lisk:lisk ./ .
COPY --from=builder /home/builder/build/node_modules/ ./node_modules/

RUN npm run build

ENTRYPOINT ["/home/lisk/bin/run"]
CMD ["start", "--network", "mainnet"]
