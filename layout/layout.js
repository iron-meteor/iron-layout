//XXX use DynamicTemplate for the layout and for the individual regions!
//XXX implement yield and contentFor

var Layout = function (options) {
  options = options || {};
};

UI.registerHelper('yield', UI.Component.extend({
  render: function () {
    var region = (typeof this === 'string') ? this : this.region;
    return 'yield'
  }
}));

UI.registerHelper('contentFor', UI.Component.extend({
  render: function () {
  }
}));

Iron = Iron || {};
Iron.Layout = Layout;
