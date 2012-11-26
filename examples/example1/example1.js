require("../../ProxyAutoload.js").register(["foo", "bar"], __dirname);

var baz = new foo.bar.Baz();
baz.greeting();
