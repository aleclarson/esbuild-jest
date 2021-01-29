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

export const createTransformer = ({ loaders, ...options }: Options = {}) => ({
  process(content: string, filename: string) {
    const ext = getExt(filename)
    const result = transformSync(content, {
      loader: loaders?.[ext] || (extname(filename).slice(1) as Loader),
      format: 'cjs',
      target: 'es2018',
      sourcemap: 'external',
      sourcefile: filename,
      ...options,
    })
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
})

function getExt(str: string) {
  const basename = path.basename(str)
  const firstDot = basename.indexOf('.')
  const lastDot = basename.lastIndexOf('.')
  const extname = path.extname(basename).replace(/(\.[a-z0-9]+).*/i, '$1')

  if (firstDot === lastDot) return extname

  return basename.slice(firstDot, lastDot) + extname
}
