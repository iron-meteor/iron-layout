String.prototype.compact = function () {
  return this.trim().replace(/\s/g, '').replace(/\n/g, '');
};

var ReactiveVar = function (value) {
  this._value = value;
  this._dep = new Deps.Dependency;
};

ReactiveVar.prototype.get = function () {
  this._dep.depend();
  return this._value;
};

ReactiveVar.prototype.set = function (value) {
  if (value !== this._value) {
    this._value = value;
    this._dep.changed();
  }
};

ReactiveVar.prototype.clear = function () {
  this._value = null;
  this._dep = new Deps.Dependency;
};

// a reactive template variable we can use
var reactiveTemplate = new ReactiveVar;

// a reactive data variable we can use
var reactiveData = new ReactiveVar;

var withDiv = function (callback) {
  var el = document.createElement('div');
  document.body.appendChild(el);
  try {
    callback(el);
  } finally {
    document.body.removeChild(el);
  }
};

var withRenderedTemplate = function (template, callback) {
  withDiv(function (el) {
    template = _.isString(template) ? Template[template] : template;
    var cmp = UI.render(template);
    UI.insert(cmp, el);
    Deps.flush();
    callback(cmp, el);
  });
};

Tinytest.add('Layout - Template layout with block content', function (test) {
  withRenderedTemplate('BlockLayout', function (tmpl, el) {
    test.equal(el.innerHTML.compact(), 'layout-main-footer');
  });
});

Template.BlockLayoutWithData.helpers({
  getData: function () {
    return 'data';
  }
});

Tinytest.add('Layout - Template layout with block content and data', function (test) {
  withRenderedTemplate('BlockLayoutWithData', function (tmpl, el) {
    test.equal(el.innerHTML.compact(), 'layout-data-main-data-footer-data');
  });
});

Tinytest.add('Layout - JavaScript layout', function (test) {
  var layout = new Iron.Layout;

  withRenderedTemplate(layout.create(), function (tmpl, el) {
    // starts off empty
    test.equal(el.innerHTML.compact(), '');

    // then we'll choose a layout
    layout.template('LayoutWithData');
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout--');

    // render the One template into the main region
    layout.render('One');
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout--One--');

    // now render Two into the footer region
    layout.render('Two', {to: 'footer'});
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout--One--Two--');


    // now set a global layout data context!
    layout.data('DATA');
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout-DATA-One-DATA-Two-DATA-');

    // and finally let's override some specific region data contexts! 
    layout.render('One', {data: 'ONE'});
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout-DATA-One-ONE-Two-DATA-');

    layout.render('Two', {to: 'footer', data: 'TWO'});
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout-DATA-One-ONE-Two-TWO-');
  });
});

Tinytest.add('Layout - JavaScript rendering transactions', function (test) {
  var layout = new Iron.Layout({template: 'RenderingTransactionsLayout'});


  withRenderedTemplate(layout.create(), function (tmpl, el) {
    // start the transaction
    layout.beginRendering();
    // render the LayoutOnePage template into the main region
    // this should also render "footer" through a contentFor block
    layout.render('LayoutOnePage');
    layout.render('Aside', {to: 'aside'});

    var renderedRegions = Object.keys(layout.endRendering());
    test.equal(renderedRegions, ['main', 'aside', 'footer']);
  });
});

Tinytest.add('Layout - has, clear and clearAll', function (test) {
  var layout = new Iron.Layout({template: 'LayoutOne'});

  withRenderedTemplate(layout.create(), function (tmpl, el) {
    // just make sure we're starting off correctly
    test.equal(el.innerHTML.compact(), 'layout-');

    // we have a main region {{> yield}}
    test.isTrue(layout.has());

    // we also should have a footer region {{> yield "footer"}}
    test.isTrue(layout.has('footer'));

    // we should not have some bogus region
    test.isFalse(layout.has('bogus'));

    // render the One template into the main region
    layout.render('One');
    Deps.flush();

    // now render Two into the footer region
    layout.render('Two', {to: 'footer'});
    Deps.flush();

    // make sure everything rendered correctly
    test.equal(el.innerHTML.compact(), 'layout-One--Two--');

    // now clear footer region
    layout.clear("footer");
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout-One--');

    // clear main region
    layout.clear();
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout-');

    // now build it back up again and clearAll
    layout.render('One');
    layout.render('Two', {to: 'footer'});
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout-One--Two--');

    layout.clearAll();
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'layout-');
  });
});
