"use strict";
exports.__esModule = true;
exports.mockModule = void 0;
function setImplementations(mocketed, implementations) {
    var mocketedFunctions = [];
    for (var exportedName in mocketed) {
        if (mocketed[exportedName] && mocketed[exportedName].mockImplementation)
            mocketedFunctions.push(exportedName);
    }
    for (var functionName in implementations) {
        if (!mocketedFunctions.includes(functionName))
            continue;
        if (typeof implementations[functionName] == 'function') {
            mocketed[functionName].mockImplementation(implementations[functionName]);
            continue;
        }
        if (implementations[functionName].classConstructor)
            mocketed[functionName].mockImplementation(implementations[functionName].classConstructor);
        var prototype = mocketed[functionName].prototype;
        for (var methodName in implementations[functionName]) {
            if (prototype[methodName] && prototype[methodName].mockImplementation) {
                prototype[methodName].mockImplementation(implementations[functionName][methodName]);
            }
            else {
                prototype[methodName] = jest.fn(implementations[functionName][methodName]);
            }
        }
    }
}
function mockedAll(mockeble) {
    var exportedFunctions = [];
    for (var exportedName in mockeble) {
        if (typeof mockeble[exportedName] == 'function')
            exportedFunctions.push(exportedName);
    }
    for (var _i = 0, exportedFunctions_1 = exportedFunctions; _i < exportedFunctions_1.length; _i++) {
        var nameExportedFunction = exportedFunctions_1[_i];
        var prototype = mockeble[nameExportedFunction].prototype;
        if (!mockeble[nameExportedFunction].mockImplementation) {
            mockeble[nameExportedFunction] = jest.fn(mockeble[nameExportedFunction]);
        }
        prototype = mockeble[nameExportedFunction].prototype = prototype;
        if (prototype) {
            mockedAll(prototype);
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
function mockModule(mockebleModule, implementations) {
    // проверка делается внутри
    mockedAll(mockebleModule);
    if (implementations) {
        // проверка делается внутри
        setImplementations(mockebleModule, implementations);
    }
    return mockebleModule;
}
exports.mockModule = mockModule;
