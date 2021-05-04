import { Loader, transformSync } from 'esbuild'
import path, { extname } from 'path'

export interface Options {
  jsxFactory?: string
  jsxFragment?: string
  loaders?: {
    [ext: string]: Loader
  }
  target?: string
}

export default {
  createTransformer(options: Options | null) {
    if (!options) options = {}
    const { loaders = {} } = options
    delete options.loaders
    return {
      process(content: string, filename: string) {
        const ext = getExt(filename)
        const strict = /^(im|ex)port /m.test(content)
        const result = transformSync(content, {
          loader: loaders[ext] || (extname(filename).slice(1) as Loader),
          format: 'cjs',
          target: 'es2018',
          sourcemap: 'external',
          sourcefile: filename,
          ...options,
          // Esbuild does not enable strict mode when compiling ES modules to
          // CommonJS format: https://github.com/evanw/esbuild/issues/422#issuecomment-739740602
          banner: strict ? '"use strict";' : undefined,
        })
        if (/\bjest\.mock\b/.test(result.code)) {
          const { nebu } = require('nebu') as typeof import('nebu')
          result.code = nebu.process(result.code, {
            plugins: [hoistJestMock],
            state: { strict },
          }).js
        }
        const map = {
          ...JSON.parse(result.map),
          sourcesContent: null,
        }
        // Append the inline sourcemap manually to ensure the "sourcesContent"
        // is null. Otherwise, breakpoints won't pause within the actual source.
        return {
          code:
            result.code +
            '\n//# sourceMappingURL=data:application/json;base64,' +
            Buffer.from(JSON.stringify(map)).toString('base64'),
          map,
        }
      },
    }
  },
}

function getExt(str: string) {
  const basename = path.basename(str)
  const firstDot = basename.indexOf('.')
  const lastDot = basename.lastIndexOf('.')
  const extname = path.extname(basename).replace(/(\.[a-z0-9]+).*/i, '$1')

  if (firstDot === lastDot) return extname

  return basename.slice(firstDot, lastDot) + extname
}

const hoistJestMock: import('nebu').Plugin = {
  Program(prog, { strict }) {
    // Keep "use strict" on top.
    const hoistTo = strict ? prog.body[1] : prog

    prog.walk('body', stmt => {
      if (!stmt.isExpressionStatement()) return
      const expr = stmt.expression
      if (!expr.isCallExpression()) return
      if (!expr.callee.isMemberExpression()) return
      const callee = expr.callee.toString()
      if (callee == 'jest.mock') {
        hoistTo.before(stmt.toString() + '\n')
        stmt.remove()
      }
    })
  },
}
