const obj = {
  a: 0,
  b: 0,
  myfunc: function() {
    console.log(this.a + this.b);
  }
};

obj.a = 2;
obj.b = 3;
obj.myfunc();
