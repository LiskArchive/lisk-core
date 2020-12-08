#!/bin/sh -xe

/home/lisk/node_modules/.bin/lisk-core blockchain:download --network=$1
/home/lisk/node_modules/.bin/lisk-core blockchain:import --force blockchain.db.tar.gz
