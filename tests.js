suite("Parameterize", function() {
	var assume = require('assume');
	var Parameterize = require("./index.js");

	suite("non deep property access", function () {
    test("with propert access", function() {
      let template = { id: "{{ clientId }}" };
      let context = { clientId: "123"};
      let engine = new Parameterize(template, context);
      engine.render();
      assume(engine.gettemplate()).deep.equals({id: "123"});
    });

    test("with array access", function() {
      let template = { id: "{{ $arr(0) }}", name: "{{ $arr(2) }}", count: "{{ $arr(1) }}", };
      let context = {arr: ["123", 248, "doodle"],}
      let par = new Parameterize(template, context);
      par.render();
      assume(par.gettemplate()).deep.equals({id: "123", name: "doodle", count: "248"}); 
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
      assume(par.gettemplate()).deep.equals({name: "jim", username: "foobar"});
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
      assume(par.gettemplate()).deep.equals({image_version: "12.10", name: "ubuntu"});
    });
  });

  suite("non parameterized json template", function() {
    test("empty template", function() {
      let template = {};
      let context = {};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.gettemplate()).deep.equals({});
    });

    test("non parameterized template", function() {
      let template = {a: {b: {c: {d: "name"}}}};
      let context = {};
      let par = new Parameterize(template, context);
      par.render();
      assume(par.gettemplate()).deep.equals(template);
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
      assume(par.gettemplate()).deep.equals({a: "a"});
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
      assume(par.gettemplate()).deep.equals({a: "b"});
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
      assume(par.gettemplate()).deep.equals({b : {a: "a"}});
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
      assume(par.gettemplate()).deep.equals({b: {a: "b"}});
    });
  })
});