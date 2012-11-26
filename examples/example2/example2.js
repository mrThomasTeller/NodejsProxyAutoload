var pal = require("../../ProxyAutoload.js");
var path = require("path");
var fs = require("fs");

pal.register(["foo", "bar"], {
	isClass: function (pckg, name)
	{
		return fs.existsSync(path.join(__dirname, pckg.path, name + ".js"));
	},
	onCreatePackage: function (parent, name, pckg)
	{
		pckg.path = pal.isPackage(parent) ? path.join(parent.path, name) : name;
	},
	loadClass: function (parent, name, pckg)
	{
		pckg[name] = require(path.join(__dirname, pckg.path, name));
	}
}, "example2");

var baz = new pal.example2.Foo.Bar.Baz();
baz.greeting();
