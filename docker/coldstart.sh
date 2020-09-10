#!/bin/sh -xe

/home/lisk/node_modules/.bin/lisk-core blockchain:download --network=$1
ls -l
file blockchain.db.gz
/home/lisk/node_modules/.bin/lisk-core blockchain:import --force blockchain.db.gz
