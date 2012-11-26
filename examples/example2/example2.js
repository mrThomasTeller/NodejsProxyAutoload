var pal = require("../../ProxyAutoload.js");
var path = require("path");
var fs = require("fs");

console.log(__dirname);

pal.register(["Foo", "Bar"], {
	isClass: function (pckg, name)
	{
		return fs.existsSync(path.join(__dirname, pckg.path, name + ".js"));
	},
	onCreatePackage: function (parent, name, pckg)
	{
		pckg.path = pal.isPackage(parent) ? path.join(parent.path, name) : name;
	},
	loadClass: function (pckg, name)
	{
		pckg[name] = require(path.join(__dirname, pckg.path, name));
	}
}, "example2");

var baz = new pal.example2.Foo.Bar.Baz();
baz.greeting();
