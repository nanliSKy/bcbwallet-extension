## Installation

#### Install yarn
**https://yarnpkg.com/en/docs/install**

#### Install dependencies
```sh
$ yarn install
$ lerna bootstrap
```

#### Building
```sh
# Build all sources
$ yarn build
```

```sh
# Build the backend, along with the injected page script
$ yarn build:core
```

```sh
# Build only the popup component 
$ yarn build:popup
# Above doesn't work temporily
$ cd packages/popup
$ npm run release
```
#### Linting
```sh
# Run linter over the ./packages folder
$ yarn lint
```

## Documentation

Browse the [API Documentation](https://bcbwallet.readthedocs.io/en/latest/web_api.html) online.

## Links
