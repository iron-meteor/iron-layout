var DynamicTemplate = function (options) {
  options = options || {};
  this._template = options.template;
  this._data = options.data;
  this._templateDep = new Deps.Dependency;
  this._dataDep = new Deps.Dependency;
};

DynamicTemplate.prototype.template = function (value) {
  if (arguments.length === 1 && value !== this._template) {
    this._template = value;
    this._templateDep.changed();
    return;
  }

  this._templateDep.depend();
  return typeof this._template === 'function' ? this._template() : this._template;
};

DynamicTemplate.prototype.data = function (value) {
  if (arguments.length === 1 && value !== this._data) {
    this._data = value;
    this._dataDep.changed();
    return;
  }

  this._dataDep.depend();
  return typeof this._data === 'function' ? this._data() : this._data;
};

DynamicTemplate.prototype.create = function (options) {
  var self = this;

  return UI.Component.extend({
    data: function () {
      return self.data();
    },

    render: function () {
      var cmp = this;
      return Spacebars.include(function () {
        var template = self.template();

        if (typeof template === 'string')
          return Template[template];

        if (typeof template === 'object')
          return template;

        if (typeof cmp.__content !== 'undefined')
          return cmp.__content;

        // guess we don't have a template assigned yet
        return null;
      });
    }
  });
};

DynamicTemplate.prototype.render = function (options) {
  options = options || {};

  if (this.component)
    throw new Error("component is already rendered");

  var component = this.create();
  this.component = UI.render(component, options.parentComponent, options);
  return this.component;
};

DynamicTemplate.prototype.insert = function (options) {
  options = options || {};

  var el = options.el || document.body;
  var $el = $(el);

  if ($el.length === 0)
    throw new Error("No element to insert layout into. Is your element defined? Try a Meteor.startup callback.");

  UI.insert(this.render(), $el[0], options.nextNode);
};

Iron = Iron || {};
Iron.DynamicTemplate = DynamicTemplate;

UI.registerHelper('DynamicTemplate', UI.Component.extend({
  render: function () {
    var template = new DynamicTemplate({
      template: this.lookup('template'), 
      data: this.lookup('data')
    });

    return template.create();
  }
}));
