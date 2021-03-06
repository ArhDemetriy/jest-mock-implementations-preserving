import { NewCall, TFunction, TModule, Implementations, } from "./type"

type MethodImplementation = (...args) => any
type FunctionOrClass = MethodImplementation | { prototype: { [k: string]: MethodImplementation } }
type MockedClass = jest.Mock & { prototype: { [k: string]: MockedClass } }
type MethodsImplementations = { classConstructor?: (...args) => any, [m: string]: (...args) => any }


function setImplementations<Module>(mocketed: { [Class in keyof Module]: MockedClass }, implementations: Implementations<Module>) {
  const mocketedFunctions: Array<string> = []
  for (const exportedName in mocketed) {
    if (mocketed[exportedName] && mocketed[exportedName].mockImplementation)
      mocketedFunctions.push(exportedName)
  }

  for (const functionName in implementations) {
    if (!mocketedFunctions.includes(functionName)) continue

    if (typeof implementations[functionName] == 'function'){
      mocketed[functionName].mockImplementation(implementations[functionName] as MethodImplementation)
      continue
    }
    if ((implementations[functionName] as MethodsImplementations).classConstructor)
      mocketed[functionName].mockImplementation((implementations[functionName] as MethodsImplementations).classConstructor)

    const prototype: { [k: string]: MockedClass } = mocketed[functionName].prototype
    for (const methodName in implementations[functionName]) {
      if (prototype[methodName] && prototype[methodName].mockImplementation) {
        prototype[methodName].mockImplementation(implementations[functionName][methodName] as TFunction)
      } else {
        prototype[methodName] = jest.fn(implementations[functionName][methodName] as TFunction)
      }
    }
  }
}

function mockedAll<Module>(mockeble: { [Class in keyof Module]: FunctionOrClass }) {
  const exportedFunctions: Array<keyof typeof mockeble> = []
  for (const exportedName in mockeble) {
    if (typeof mockeble[exportedName] == 'function')
      exportedFunctions.push(exportedName)
  }

  for (const nameExportedFunction of exportedFunctions) {
    let prototype: { [k: string]: MethodImplementation } = mockeble[nameExportedFunction].prototype
    if (!(mockeble[nameExportedFunction] as jest.Mock).mockImplementation) {
      mockeble[nameExportedFunction] = jest.fn(mockeble[nameExportedFunction] as MethodImplementation)
    }
    prototype = (mockeble[nameExportedFunction] as any).prototype = prototype
    if (prototype) {
      mockedAll(prototype)
    }
  }
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
function mockModule<Module extends TModule = any>(
  mockebleModule: { [exported in keyof Module]: Module[exported] },
  implementations: {
    [exported in keyof Module]?:
      Module[exported] extends NewCall ?
        | { [method in keyof InstanceType<Module[exported]>]?: (this: InstanceType<Module[exported]>, ...args: Parameters<InstanceType<Module[exported]>[method]>) => ReturnType<InstanceType<Module[exported]>[method]> }
        | { classConstructor?: (this: InstanceType<Module[exported]>, ...args: ConstructorParameters<Module[exported]>)=> void }
      : Module[exported] extends TFunction ?
        ((this: Module[exported], ...args: Parameters<Module[exported]>) => ReturnType<Module[exported]>)
      : ((...args) => any) | { classConstructor?: (...args) => any, [k: string]: (...args) => any }
  } = {}
): { [exported in keyof Module]: Module[exported] }
{
  // ???????????????? ???????????????? ????????????
  mockedAll<typeof mockebleModule>(mockebleModule as unknown as { [Class in keyof Module]: FunctionOrClass })

  if (implementations) {
    // ???????????????? ???????????????? ????????????
    setImplementations<typeof mockebleModule>(mockebleModule as unknown as { [Class in keyof Module]: MockedClass }, implementations)
  }

  return mockebleModule
}

export {
  mockModule,
  Implementations,
}
