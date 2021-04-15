# jest-mock-implementations-preserving
Auto jest-mock safety implementations
## Проблема
jest мокает модули удаляя реализацию. А хотелось-бы сохранять её.
## Решение без этого пакета
Можно было-бы использовать
``` js
jest.mock('./foo', () => {
  const originalModule = jest.requireActual('./foo')
  ********* // навешивание моков на originalModule
  return mockedModule
})
```
но каждый раз приходилось-бы писать реализацию фабрики заного.
## Решение с этим пакетом
Просто вызови экспортируемую функцию
### если нужен только мок
``` js
import { mockModule } from 'jest-mock-implementations-preserving'
jest.mock('./foo', () => mockModule(jest.requireActual('./foo')))
```
### если нужен мок с заменой реализации
``` js
import { mockModule } from 'jest-mock-implementations-preserving'
jest.mock('./foo', () => mockModule(jest.requireActual('./foo'), {
  Foo: () => { console.log('Foo is mocked !!!') },
}))
```
### если нужен мок класса с частичной заменой реализации
``` ts
// foo.ts
class Foo{
  fooText = 'Foo not mocked'
  constructor() { }
  getText() { return this.fooText }
  fooTest() { console.log(this.getText()) }
}
export { Foo }
```
``` ts
// foo.test.ts
import { mockModule } from 'jest-mock-implementations-preserving'
jest.mock('./foo', () => mockModule(jest.requireActual('./foo'), {
  Foo: {
    // Осторожно. Полностью заменяет реализацию.
    classConstructor: function () { this.fooText = 'Foo is mocked' },
    getText: function () { return this.fooText + ' !!!' },
  },
}))
const foo = new Foo()
foo.fooTest() // log "Foo is mocked !!!"
```
## TypeScript magic
то, ради чего и собирался этот пакет. Автоподстановка методов класса, и ограничение на параметры методов и возвращаемые ими значения.
``` ts
// foo.ts
class Foo {
  constructor(s: string) { }
  fooTest(n: number) { return `${n}` }
}
function bar(b: boolean) { }
```
``` ts
// foo.test.ts
import { Foo, bar } from "./foo"
jest.mock("./foo", () => mockModule<{ Foo: typeof Foo, bar: typeof bar }>(jest.requireActual("./foo"), {
  // f intelliSense to "Foo"
  f,
  // error
  Foo: 321,
  // ok
  Foo: { },
  Foo: {
  // methods
    // error
    fooTest: 'asd',
    fooTest: () => { },
    fooTest: (n: string) => '',
    //  ok
    fooTest: () => '',
    fooTest: (n) => '',
    fooTest: (n: number) => '',

  // constructor
    // error
    classConstructor: function (q: boolean) { },
    // ok
    classConstructor: function () { },
    classConstructor: function (q: string) { },
  },
}))
```
