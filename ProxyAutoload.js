'use strict';

let path = require("path");

let registered = {};

/**
 * Handler implies the same files structure as following (root - is directory passed as "path", ns - is namespace which
 * you registered the handler with):
 * root
 * └─ns
 *   ├─foo
 *   │ └─bar
 *   │   └─FooBar.js
 *   └─Baz.js
 *
 * So you should name your classes like these ():
 * ns.foo.bar.FooBar
 * ns.Baz
 *
 * @param {String} path root directory for autoloading
 * @constructor
 */
function DefaultHandler(path)
{
    this.__path = path;
}

/**
 * Checks whether pckg[name] should be class (module) or package. You can validate symbol name and availability in this
 * method.
 * @param {Object} pckg parent symbol
 * @param {String} name current symbol name
 * @return {Boolean}
 */
DefaultHandler.prototype.isClass = function (pckg, name)
{
    return name[0] == name[0].toUpperCase();
};

/**
 * Method runs after new package creating.
 * @param {Object} parent parent symbol
 * @param {String} name package name
 * @param {Object} pckg new package
 */
DefaultHandler.prototype.onCreatePackage = function (parent, name, pckg)
{
    pckg.path = isPackage(parent) ? path.join(parent.path, name) : name;
};

/**
 * Loads class for passed package and class name.
 * @param {Object} pckg parent package
 * @param {String} name class name
 */
DefaultHandler.prototype.loadClass = function (pckg, name)
{
    require(path.join(this.__path, pckg.path, name));
};

/**
 * Adds one or several symbols to passed root symbol. These symbols will load classes or modules automatically when it's
 * necessary. It's true lazy autoloading. You should run node.js with --harmony flag, because ES6 Proxy used for that.
 * Handler provides the way to load your classes. If handler is just string then default handler with
 * passed string as root directory will be used. By default classes names begin with first letter in upper case, other
 * symbols are packages. A handler is object which contains "isClass" and "loadClass" methods, and can contain
 * "onCreatePackage" (see the interface of DefaultHandler for details).
 * If rootSymbol parameter is not specified then namespaces will be added to global scope.
 * If an object passed as rootSymbol then child packages and classes will be added in this symbol
 * If string passed then symbols will be added to exports[rootSymbol] of this module, and if "." passed then symbols
 * will be added to exports of this module.
 *
 * @param {String|Array.<String>} namespaces one or more namespaces which should support autoloading
 * @param {Object|String} handler object which provides the way to load classes
 * @param {Object|String} [rootSymbol=global] symbol which child symbols will be added to
 */
function register(namespaces, handler, rootSymbol)
{
    if (!rootSymbol)
    {
        rootSymbol = global;
    }

    if (typeof rootSymbol == "string")
    {
        rootSymbol = rootSymbol == "." ? exports : (exports[rootSymbol] = {});
    }

    if (!Array.isArray(namespaces))
    {
        namespaces = [namespaces];
    }

    if (typeof handler == "string")
    {
        handler = new DefaultHandler(handler);
    }

    namespaces.forEach(function (namespace)
    {
        registered[namespace] = {
            handler: handler,
            name: namespace
        };

        createProxy(rootSymbol, namespace);
    });
}

/**
 * Checks whether obj is package or not (root symbol or class)
 * @param obj
 * @return {*}
 */
function isPackage(obj)
{
    return obj.proxyAutoloadingPackage;
}

exports.DefaultHandler = DefaultHandler;
exports.register = register;
exports.isPackage = isPackage;

function createProxy(parent, name)
{
    let proxy;
    let pckg = {};

    proxy = parent[name] = Proxy.create({
        get: function (target, name)
        {
            if (!pckg.hasOwnProperty(name))
            {
                loadSymbol(proxy, name);
            }

            return pckg[name];
        },
        set: function (target, name, value)
        {
            pckg[name] = value;
        },
        has: function (target, name)
        {
            return name in pckg;
        },
        hasOwn: function (target, name)
        {
            return pckg.hasOwnProperty(name);
        }
    }, Object.getPrototypeOf(pckg));

    proxy.proxyAutoloadingPackage = true;

    let namespace = isPackage(parent) ? parent.namespace : name;
    proxy.namespace = namespace;

    proxy.shortName = name;
    proxy.fullName = isPackage(parent) ? parent.fullName + '.' + name : name;

    let handler = registered[namespace].handler;
    handler.onCreatePackage && handler.onCreatePackage(parent, name, proxy);
}

function loadClass(pckg, name)
{
    let handler = registered[pckg.namespace].handler;
    handler.loadClass(pckg, name);

    let cls = pckg[name];
    cls.shortName = name;
    cls.fullName = pckg.fullName + '.' + name;
}

function loadSymbol(parent, name)
{
    let handler = registered[parent.namespace].handler;

    if (handler.isClass(parent, name))
    {
        loadClass(parent, name);
    }
    else
    {
        createProxy(parent, name);
    }
}
