#!/bin/bash

npm run build
./node_modules/.bin/np --no-publish "$@"
