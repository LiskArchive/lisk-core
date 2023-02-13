ARG NODEJS_VERSION=16

##### Stage 1

FROM node:$NODEJS_VERSION-alpine AS builder

RUN apk add --no-cache alpine-sdk=1.0-r1 python3=3.10.10-r0 libtool=2.4.7-r1 autoconf=2.71-r1 automake=1.16.5-r1 rust=1.64.0-r2 cargo=1.64.0-r2 cmake=3.24.3-r0 clang15-libs=15.0.7-r0 clang15-dev=15.0.7-r0 clang15=15.0.7-r0 rustfmt=1.64.0-r2 linux-headers=5.19.5-r0 && \
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
