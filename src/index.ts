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
      sourcemap: 'both',
      sourcefile: filename,
      ...options,
    })
    return {
      code: result.code,
      map: {
        ...JSON.parse(result.map),
        sourcesContent: null,
      },
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
