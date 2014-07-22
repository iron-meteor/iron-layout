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
    var range = Blaze.render(template);
    range.attach(el);
    Deps.flush();
    callback(el);
  });
};

Tinytest.add('Layout - Template layout with block content', function (test) {
  withRenderedTemplate('BlockLayout', function (el) {
    test.equal(el.innerHTML.compact(), 'layout-main-footer');
  });
});

Template.BlockLayoutWithData.helpers({
  getData: function () {
    return 'data';
  }
});
Tinytest.add('Layout - Template layout with block content and data', function (test) {
  withRenderedTemplate('BlockLayoutWithData', function (el) {
    test.equal(el.innerHTML.compact(), 'layout-data-main-data-footer-data');
  });
});

Template.BlockLayoutWithOuterData.data = null;
Template.BlockLayoutWithOuterData.helpers({
  getData: function () {
    return Template.BlockLayoutWithOuterData.data;
  }
});

Template.LayoutWithWith.data = null;
Template.LayoutWithWith.helpers({
  getData: function () {
    return Template.LayoutWithWith.data;
  }
});

// Solution to this problem is probably something similar to https://github.com/EventedMind/blaze-layout/commit/96506ba163aa26ef2d00ec6cb2303df19230045d
Tinytest.add('Layout - data - yield inherits data from outside by default', function (test) {
  Template.BlockLayoutWithOuterData.data = null;
  Template.LayoutWithWith.data = null;
  withRenderedTemplate('BlockLayoutWithOuterData', function (el) {
    test.equal(el.innerHTML.compact(), 'inner-outerData');
  });
});

Tinytest.add('Layout - data - setting yield data overrides yield default', function (test) {
  Template.BlockLayoutWithOuterData.data = 'layoutData';
  Template.LayoutWithWith.data = 'yieldData';
  withRenderedTemplate('BlockLayoutWithOuterData', function (el) {
    test.equal(el.innerHTML.compact(), 'inner-yieldData');
  });
});

Tinytest.add('Layout - data - setting layout data overrides yield default', function (test) {
  Template.BlockLayoutWithOuterData.data = 'layoutData';
  Template.LayoutWithWith.data = null;
  withRenderedTemplate('BlockLayoutWithOuterData', function (el) {
    test.equal(el.innerHTML.compact(), 'inner-layoutData');
  });
});

Template.BlockLayoutNestedWiths.data = null;
Template.BlockLayoutNestedWiths.helpers({
  getData: function () {
    return Template.BlockLayoutNestedWiths.data;
  }
});

// This one is more complex but should probably be made to work
Tinytest.add('Layout - data - with in context trumps all else', function (test) {
  Template.BlockLayoutNestedWiths.data = null;
  Template.LayoutWithWith.data = null;
  withRenderedTemplate('BlockLayoutNestedWiths', function (el) {
    test.equal(el.innerHTML.compact(), 'layout-outerData-inner-innerData-outerData');
  });
});

Tinytest.add('Layout - data - with in context trumps layout data', function (test) {
  Template.BlockLayoutNestedWiths.data = 'layoutData';
  Template.LayoutWithWith.data = null;
  withRenderedTemplate('BlockLayoutNestedWiths', function (el) {
    test.equal(el.innerHTML.compact(), 'layout-layoutData-inner-innerData-layoutData');
  });
});

Tinytest.add('Layout - data - yield data trumps with in context', function (test) {
  Template.BlockLayoutNestedWiths.data = 'layoutData';
  Template.LayoutWithWith.data = 'yieldData';
  withRenderedTemplate('BlockLayoutNestedWiths', function (el) {
    test.equal(el.innerHTML.compact(), 'layout-layoutData-inner-yieldData-innerData');
  });
});


Tinytest.add('Layout - JavaScript layout', function (test) {
  var layout = new Iron.Layout;

  withRenderedTemplate(layout.create(), function (el) {
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


  withRenderedTemplate(layout.create(), function (el) {
    // start the transaction and provide an oncomplete callback
    var calls = [];
    layout.beginRendering(function onComplete(regions) {
      calls.push({
        regions: regions
      });
    });
    // render the LayoutOnePage template into the main region
    // this should also render "footer" through a contentFor block
    layout.render('LayoutOnePage');
    layout.render('Aside', {to: 'aside'});

    Deps.flush();
    test.equal(calls.length, 1);
    test.equal(calls[0].regions, ['main', 'aside', 'footer']);
  });
});

Tinytest.add('Layout - rendering transactions multiple calls to beginRendering', function (test) {
  var layout = new Iron.Layout({template: 'RenderingTransactionsLayout'});

  withRenderedTemplate(layout.create(), function (el) {
    // start the transaction and provide an oncomplete callback
    var calls = [];

    var onComplete = function onComplete (regions) {
      calls.push({
        regions: regions
      });
    };

    layout.beginRendering(onComplete);

    // render the LayoutOnePage template into the main region
    // this should also render "footer" through a contentFor block
    layout.render('LayoutOnePage');
    layout.render('Aside', {to: 'aside'});

    // now before we flush call beginRendering again. the previous transaction
    // should immediately complete
    layout.beginRendering(onComplete);

    // this time our onComplete should only register the main region being
    // rendered.
    layout.render('LayoutOnePage');

    // now actually flush
    Deps.flush();
    test.equal(calls.length, 2, "onComplete called for both rendering transactions");

    // first time, the rendered regions only include the programmatic ones
    // because the contentFor doesn't have a change to run.
    var regions = calls[0].regions;
    test.equal(regions.length, 2);
    test.isTrue(_.contains(regions, "main"));
    test.isTrue(_.contains(regions, "aside"));

    var regions = calls[1].regions;
    test.equal(regions.length, 2);
    test.isTrue(_.contains(regions, "main"));
    test.isTrue(_.contains(regions, "footer"));
  });
});

Tinytest.add('Layout - has, clear and clearAll', function (test) {
  var layout = new Iron.Layout({template: 'LayoutOne'});

  withRenderedTemplate(layout.create(), function (el) {
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

Tinytest.add('Layout - default layout', function (test) {
  // no default template
  var layout = new Iron.Layout;

  withRenderedTemplate(layout.create(), function (el) {
    layout.render('Plain');
    Deps.flush();
    test.equal(el.innerHTML.compact(), 'plain', 'no default layout');
  });
});
