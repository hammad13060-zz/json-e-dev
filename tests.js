suite("Parameterize", function() {
	var assume = require('assume');
	var Parameterize = require("./index.js");

	suite("non deep property access", function () {
    test("with propert access", function() {
      let template = { id: "{{ clientId }}" };
      let context = { clientId: "123"};
      let engine = new Parameterize(template, context);
      engine.render();
      assume(engine.getTemplate()).deep.equals({id: "123"});
    });

    test("with array access", function() {
      let template = { id: "{{ $arr(0) }}", name: "{{ $arr(2) }}", count: "{{ $arr(1) }}", };
      let context = {arr: ["123", 248, "doodle"],}
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({id: "123", name: "doodle", count: "248"}); 
    });

    test("function evaluation", function() {
      let template = {
        name: "{{ func('jim') }}",
        username: "{{ func(a) }}",
      }
      let context = {
        a: "foobar",
        func: function(value) {
          return value;
        }
      }
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({name: "jim", username: "foobar"});
    });

    test("Modify string", function() {
      var template = {
        key1:     "{{ toUpper( 'hello world') }}",
        key2:     "{{  toLower(toUpper('hello world'))   }}",
        key3:     "{{   toLower(  toUpper(  text))  }}",
      };
      var context = {
        toUpper: function(text) {
          return text.toUpperCase();
        },
        toLower: function(text) {
          return text.toLowerCase();
        },
        text: 'hello World'
      };
      var output = {
        key1:     "HELLO WORLD",
        key2:     "hello world",
        key3:     "hello world"
      };
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals(output)
  });
  });

  suite("deep propert access", function() {
    test("with deep array access", function() {
      let template = {image_version: "{{task.$images(0).$versions(0)}}", name: "{{task.$images(0).name}}"};
      let context = {
        task: {
          images: [{versions: ["12.10", ], name: "ubuntu"}]
        }
      };
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({image_version: "12.10", name: "ubuntu"});
    });
  });

  suite("non parameterized json template", function() {
    test("empty template", function() {
      let template = {};
      let context = {};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({});
    });

    test("non parameterized template", function() {
      let template = {a: {b: {c: {d: "name"}}}};
      let context = {};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals(template);
    });
  });


  suite("constructs", function() {
    test("if -> then non-deep", function() {
      let template = {
        a: {
          $if: "1 < 2",
          $then: "a",
          $else: "b"
        }
      };
      let context = {};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({a: "a"});
    });

    test("if -> else non-deep", function() {
      let template = {
        a: {
          $if: "1 > 2",
          $then: "a",
          $else: "b"
        }
      };
      let context = {};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({a: "b"});
    });

    test("if -> then deep", function() {
      let template = {
        b: {a: {
          $if: "1 < 2",
          $then: "a",
          $else: "b"
        }}
      };
      let context = {};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({b : {a: "a"}});
    });

    test("if -> else deep", function() {
      let template = {
        b: {a: {
          $if: "1 > 2",
          $then: "a",
          $else: "b"
        }}
      };
      let context = {};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({b: {a: "b"}});
    });

    test("switch with only one option", function() {
      let template = {
        a: {
          $switch: "'case' + a",
          case1: "foo"
        }};
      let context = {a: "1"};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({a: "foo"});
    });

    test("switch with multiple options", function() {
      let template = {
        a: {
          $switch: "'case' + b",
          case1: "foo",
          case2: "bar"
        }};
      let context = {a: "1", b: "2"};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals({a: "bar"});
    });

    test("eval with multiple function evaluations", function() {
        var template = {
        value: [
          {$eval: 'func(0)'},
          {$eval: 'func(0)'},
          {$eval: 'func(-1)'},
          {$eval: 'func(-2)'},
          {$eval: 'func(0)'},
          {$eval: 'func(0)'},
          {$eval: 'func(0)'},
          {$eval: 'func(0)'},
          {$eval: 'func(0)'},
          {$eval: 'func(1+1)'}
        ]
      };
      var i = 0;
      var context = {
      'func':  function(x) { i += 1; return x + i; }
      };
      var output = {
        value: [1, 2, 2, 2, 5, 6, 7, 8, 9, 12]
      };
      let par = new Parameterize(template, context);
      par.render();
      assume(par.getTemplate()).deep.equals(output);
    });
  });

  suite("interface tests", function() {

    test("template get/set methods", function() {
      c1 = {a: {foo: "bar"}};
      c2 = {a: {b: "c"}};
      c3 = {d: {e: "f"}};
      
      var par = new Parameterize(c1, {});
      assume(par.getTemplate()).deep.equals(c1);
      
      par.setNewTemplate(c2);
      assume(par.getTemplate()).deep.not.equals(c1);
      assume(par.getTemplate()).deep.equals(c2);
      
      par.setNewTemplate(c3);
      assume(par.getTemplate()).deep.not.equals(c1);
      assume(par.getTemplate()).deep.not.equals(c1);
      assume(par.getTemplate()).deep.equals(c3);
    });

    test("context get/set methods", function() {
      c1 = {a: {foo: "bar"}};
      c2 = {a: {b: "c"}};
      c3 = {d: {e: "f"}};
      
      var par = new Parameterize({}, c1);
      assume(par.getContext()).deep.equals(c1);
      
      par.setNewContext(c2);
      assume(par.getContext()).deep.not.equals(c1);
      assume(par.getContext()).deep.equals(c2);
      
      par.setNewContext(c3);
      assume(par.getContext()).deep.not.equals(c1);
      assume(par.getContext()).deep.not.equals(c1);
      assume(par.getContext()).deep.equals(c3);
    });
  });
});