type NewCall<T = any, P extends any[] = any[]> = new (...args: P) => T
type TFunction<F extends (...args) => any = (...args) => any, Z = F> = (this: Z, ...args: Parameters<F>) => ReturnType<F>
type TModule = { [k: string]: NewCall | TFunction }
type Implementations<Module> = {
    [exported in keyof Module]?:
      | ((this: Module[exported], ...args) => any)
      | { classConstructor?: (this: Module[exported], ...args) => any, [method: string]: (this: Module[exported], ...args) => any }
  }

/**
 * Full mock module, save original implementations all class/functions
 * @param {import module}mockebleModule original module
 * @param {object}implementations mock implementations module
 * @return mocked module
 * @example
 * jest.mock("./foo", () => mockModule<{ Foo: typeof Foo }>(
 *   jest.requireActual("./foo"),
 *   {
 *      Foo: {
 *        fooTest: () => console.log('Foo mocked !!!'),
 *      },
 *   }
 * ))
 */
declare function mockModule<Module extends TModule>(
  mockebleModule: { [exported in keyof Module]: Module[exported] },
  implementations?: {
    [exported in keyof Module]?:
      | ((this: Module[exported], ...args) => any)
      | { classConstructor?: (this: Module[exported], ...args) => any, [method: string]: (this: Module[exported], ...args) => any }
  }
): { [exported in keyof Module]: Module[exported] }

export {
  NewCall,
  TFunction,
  TModule,
  Implementations,
  mockModule,
}
