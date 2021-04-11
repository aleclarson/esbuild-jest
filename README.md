# esbuild-jest

[![npm](https://img.shields.io/npm/v/@alloc/esbuild-jest.svg)](https://www.npmjs.com/package/@alloc/esbuild-jest)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/alecdotbiz)

> Jest transformer with [`esbuild`](https://github.com/evanw/esbuild/) speed

This is a fork of [`esbuild-jest`](https://github.com/aelbore/esbuild-jest) with the following added features:

- Sourcemaps enabled by default
- Strict mode enabled for modules
- Hoisted `jest.mock` calls with [nebu](https://github.com/alloc/nebu)

## Install

```bash
yarn add esbuild-jest@npm:@alloc/esbuild-jest esbuild -D
```

#### Setting up Jest config file

esbuild-jest transformer should be used in your Jest config file like this:

```js
{
  "transform": {
    "^.+\\.tsx?$": "esbuild-jest"
  }
}
```

#### Setting up Jest config file with transformOptions

```typescript
export interface Options {
  jsxFactory?: string
  jsxFragment?: string
  loaders?: {
    [ext: string]: Loader
  }
  target?: string
}
```

```js
{
  "transform": {
    "^.+\\.tsx?$": [
      "esbuild-jest",
      {
        loaders: {
          '.spec.ts': 'tsx'
        }
      }
    ]
  }
}
```
