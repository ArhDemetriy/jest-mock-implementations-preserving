type NewCall<T = any, P extends any[] = any[]> = new (...args: P) => T
type TFunction<F extends (...args) => any = (...args) => any, Z = F> = (this: Z, ...args: Parameters<F>) => ReturnType<F>
type TModule = { [k: string]: NewCall | TFunction }
type Implementations<Module> = {
    [exported in keyof Module]?:
      Module[exported] extends NewCall ?
        | { [method in keyof InstanceType<Module[exported]>]?: (this: InstanceType<Module[exported]>, ...args: Parameters<InstanceType<Module[exported]>[method]>) => ReturnType<InstanceType<Module[exported]>[method]> }
        | { classConstructor?: (this: InstanceType<Module[exported]>, ...args: ConstructorParameters<Module[exported]>)=> void }
      : Module[exported] extends TFunction ?
        ((this: Module[exported], ...args: Parameters<Module[exported]>) => ReturnType<Module[exported]>)
      : never
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
      Module[exported] extends NewCall ?
        | { [method in keyof InstanceType<Module[exported]>]?: (this: InstanceType<Module[exported]>, ...args: Parameters<InstanceType<Module[exported]>[method]>) => ReturnType<InstanceType<Module[exported]>[method]> }
        | { classConstructor?: (this: InstanceType<Module[exported]>, ...args: ConstructorParameters<Module[exported]>)=> void }
      : Module[exported] extends TFunction ?
        ((this: Module[exported], ...args: Parameters<Module[exported]>) => ReturnType<Module[exported]>)
      : never
  }
): { [exported in keyof Module]: Module[exported] }

export {
  NewCall,
  TFunction,
  TModule,
  Implementations,
  mockModule,
}
