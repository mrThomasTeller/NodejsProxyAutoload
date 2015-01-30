# Proxy Autoload - Classes and modules autoloading (without 'require') using EcmaScript 6 Proxy

[![Join the chat at https://gitter.im/mrThomasTeller/NodejsProxyAutoload](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mrThomasTeller/NodejsProxyAutoload?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[Proxy Autoload](https://github.com/mrThomasTeller/NodejsProxyAutoload) uses EcmaScript harmony proxy for supporting autoloading in your projects. Autoloading works like php class autoloading.

## Usage

You should run node.js with --harmony flag!

For better understanding check our [examples](https://github.com/mrThomasTeller/NodejsProxyAutoload/tree/master/examples).

By default your files should be placed like this:

    root
     ├─foo
     │ └─bar
     │   └─Baz.js
     └─bar
       └─StaticClass.js
So you should name your classes like these:

    foo.bar.Baz
    bar.StaticClass

Just put similar code to your project:

    require('proxy-autoload').register(['foo', 'bar'], __dirname);

So you can use all classes or modules from namespaces 'foo' and 'bar' like this:

    var baz = new foo.bar.Baz();
    baz.greeting();

## API

### register

    /**
     * @param {String|Array.<String>} namespaces one or more namespaces which should support autoloading
     * @param {Object|String} handler object which provides the way to load classes
     * @param {Object|String} [rootSymbol=global] symbol which child symbols will be added to
     */
    function register(namespaces, handler, rootSymbol)

Adds one or several symbols to passed root symbol. These symbols will load classes or modules automatically when it's necessary. It's true lazy autoloading. You should run node.js with --harmony flag, because ES6 Proxy used for that.

Handler provides the way to load your classes. If handler is just string then default handler with passed string as root directory will be used. By default classes names begin with first letter in upper case, other symbols are packages. A handler is object which contains 'isClass' and 'loadClass' methods, and can contain 'onCreatePackage' (see the interface of DefaultHandler for details).

If rootSymbol parameter is not specified then namespaces will be added to global scope.
If an object passed as rootSymbol then child packages and classes will be added in this symbol.
If string passed then symbols will be added to exports[rootSymbol] of this module, and if '.' passed then symbols will be added to exports of this module.

### DefaultHandler

    /**
     * @param {String} path root directory for autoloading
     * @constructor
     */
    function DefaultHandler(path)

Handler implies the same files structure as following (root - is directory passed as 'path', ns - is namespace which you registered the handler with):

    root
    └─ns
      ├─foo
      │ └─bar
      │   └─FooBar.js
      └─Baz.js

So you should name your classes like these:

    ns.foo.bar.FooBar
    ns.Baz

    /**
     * @param {Object} pckg parent symbol
     * @param {String} name current symbol name
     * @return {Boolean}
     */
    DefaultHandler.prototype.isClass = function (pckg, name)

Checks whether pckg[name] should be class (module) or package. You can validate symbol name and availability in this method.

    /**
     * @param {Object} parent parent symbol
     * @param {String} name package name
     * @param {Object} pckg new package
     */
    DefaultHandler.prototype.onCreatePackage = function (parent, name, pckg)

Method runs after new package creating.

    /**
     * @param {Object} pckg parent package
     * @param {String} name class name
     */
    DefaultHandler.prototype.loadClass = function (pckg, name)

Loads class for passed package and class name.

### isPackage

    /**
     * @param obj
     * @return {*}
     */
    function isPackage(obj)

Checks whether obj is package or not (root symbol or class)
