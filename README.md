# grove.prx.org
Inventory management system

# Install

## Local Install

Make sure you're running the node version in `.nvmrc`, and you're off!

``` sh
# install dependencies (https://yarnpkg.com/en/docs/install)
yarn install

# run tests in Chrome
yarn test
```
## Docker Install
This guide assumes you already have docker and dinghy installed.

``` sh
# build a docker image
docker-compose build

# make sure your AUTH_CLIENT_ID is the .docker one
vim .env

# run the dev server
docker-compose up

# open up a browser to view
open https://grove.prx.docker

# run tests in PhantomJS
docker-compose run grove test
docker-compose run grove testonce

```
