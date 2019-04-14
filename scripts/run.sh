#! /bin/bash

npm run tools:peers:seed:node
npm run tools:peers:network:nodes
npm run tools:delegates:enable
npm run features || true
npm run stress:generic || true
npm run stress:diversified
