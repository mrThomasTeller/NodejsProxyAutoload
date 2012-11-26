foo.bar.Baz = function(){};

foo.bar.Baz.prototype.greeting = function()
{
    console.log("Hello 'foo.bar.Baz'!");
    bar.StaticClass.greeting();
};
