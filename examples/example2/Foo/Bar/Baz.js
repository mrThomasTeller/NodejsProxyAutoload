var pal = require("../../../../ProxyAutoload.js");

var Baz = module.exports = function(){};

Baz.prototype.greeting = function()
{
    console.log("Hello 'Foo.Bar.Baz'!");
    pal.example2.Bar.StaticClass.greeting();
};
