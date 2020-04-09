#! /bin/bash

npm run tools:peers:seed:node
npm run features || true
npm run stress:generic
