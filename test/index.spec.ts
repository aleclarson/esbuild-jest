import mockfs = require('mock-fs')
import esbuildJest from '../src/index'

const { process } = esbuildJest.createTransformer({})

afterEach(() => {
  mockfs.restore()
})

test('ts file', () => {
  const content = `
    import names from './names'

    export function display() {
      return names
    }
  `
  const output = process(content, './index.ts')
  expect(output.code).toMatchSnapshot()
  expect(output.map).toMatchSnapshot()
})

test('tsx file', async () => {
  const content = `
    export default class Foo {
      render() {
        return <div className="hehe">hello there!!!</div>
      }
    }
  `
  const output = process(content, './index.tsx')
  expect(output.code).toMatchSnapshot()
  expect(output.map).toMatchSnapshot()
})
