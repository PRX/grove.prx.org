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


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.9.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
