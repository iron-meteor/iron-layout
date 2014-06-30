/**
 * Find the first Layout in the rendered parent hierarchy.
 */
findFirstLayout = function (cmp) {
  while (cmp) {
    if (cmp.kind === 'Iron.Layout')
      return cmp.__dynamicTemplate__;
    else
      cmp = cmp.parent;
  }

  return null;
};

/**
 * Dynamically render templates into regions.
 *
 * Layout inherits from Iron.DynamicTemplate and provides the ability to create
 * regions that a user can render templates or content blocks into. The layout
 * and each region is an instance of DynamicTemplate so the template and data
 * contexts are completely dynamic and programmable in javascript.
 */
Layout = function (options) {
  Layout.__super__.constructor.apply(this, arguments);
  this.kind = 'Iron.Layout';
  this._regions = {};

  // if there's block content then render that
  // to the main region
  if (options.content)
    this.render(options.content);
};

/**
 * The default region for a layout where the main content will go.
 */
DEFAULT_REGION = Layout.DEFAULT_REGION = 'main';

/**
 * Inherits from Iron.DynamicTemplate which gives us the ability to set the
 * template and data context dynamically.
 */
Meteor._inherits(Layout, Iron.DynamicTemplate);

/**
 * Return the DynamicTemplate instance for a given region. If the region doesn't
 * exist it is created.
 *
 * The regions object looks like this:
 *
 *  {
 *    "main": DynamicTemplate,
 *    "footer": DynamicTemplate,
 *    .
 *    .
 *    .
 *  }
 */
Layout.prototype.region = function (name, options) {
  return this._ensureRegion(name, options);
};

/**
 * Render a template or content block into a given region or the main region by
 * default.
 */
Layout.prototype.render = function (template, options) {
  // having options is usually good
  options = options || {};

  // let the user specify the region to render the template into
  var region = options.to || options.region || DEFAULT_REGION;

  // get the DynamicTemplate for this region
  var dynamicTemplate = this.region(region);

  // if we're in a rendering transaction, track that we've rendered this
  // particular region
  this._trackRenderedRegion(region);

  // set the template value for the dynamic template
  dynamicTemplate.template(template);

  // if we have data go ahead and set the data for the dynamic template,
  // otherwise, leave it be.
  if (options.data)
    dynamicTemplate.data(options.data);
};

Layout.prototype.beginRendering = function () {
  if (this._renderedRegions)
    throw new Error("You called beginRendering again before calling endRendering");
  this._renderedRegions = {};
};

Layout.prototype._trackRenderedRegion = function (region) {
  if (!this._renderedRegions)
    return;
  this._renderedRegions[region] = true;
};

Layout.prototype.endRendering = function () {
  var renderedRegions = this._renderedRegions;
  this._renderedRegions = null;
  return renderedRegions;
};

Layout.prototype._ensureRegion = function (name, options) {
 return this._regions[name] = this._regions[name] || new Iron.DynamicTemplate(options);
};

/**
 * Create a region in the closest layout ancestor.
 *
 * Examples:
 *    <aside>
 *      {{> yield "aside"}}
 *    </aside>
 *
 *    <article>
 *      {{> yield}}
 *    </article>
 *
 *    <footer>
 *      {{> yield "footer"}}
 *    </footer>
 *
 * Note: The helper is a UI.Component object instead of a function so that
 * Meteor UI does not create a Deps.Dependency.
 */
UI.registerHelper('yield', UI.Component.extend({
  render: function () {
    var layout = findFirstLayout(this);

    if (!layout)
      throw new Error("No Iron.Layout found so you can't use yield!");

    // Example options: {{> yield region="footer"}} or {{> yield "footer"}}
    var options = this.get();
    var region;

    if (_.isString(options)) {
      region = options;
    } else if (_.isObject(options)) {
      region = options.region;
    }

    // if there's no region specified we'll assume you meant the main region
    region = region || DEFAULT_REGION;

    // Add the region to the layout if it doesn't exist already and call the
    // create() method on the new DynamicTemplate to create the UI.Component and
    // return it. DynamicTemplate is not an instance of UI.Component.
    return layout.region(region).create();
  }
}));

/**
 * Render a template into a region in the closest layout ancestor from within
 * your template markup.
 *
 * Examples:
 *
 *  {{#contentFor "footer"}}
 *    Footer stuff
 *  {{/contentFor}}
 *
 *  {{> contentFor region="footer" template="SomeTemplate" data=someData}}
 *
 * Note: The helper is a UI.Component object instead of a function so that
 * Meteor UI does not create a Deps.Dependency.
 */
UI.registerHelper('contentFor', UI.Component.extend({
  render: function () {
    var layout = findFirstLayout(this);

    if (!layout)
      throw new Error("No Iron.Layout found so you can't use contentFor!");

    var options = this.get() || {}
    var content = this.__content;
    var template = options.template;
    var data = options.data;

    if (_.isString(options))
      region = options;
    else if (_.isObject(options))
      region = options.region;
    else
      throw new Error("Which region is this contentFor block supposed to be for?");

    // set the region to a provided template or the content directly.
    layout.region(region).template(template || content);

    // tell the layout to track this as a rendered region if we're in a
    // rendering transaction.
    layout._trackRenderedRegion(region);

    // if we have some data then set the data context
    if (data)
      layout.region(region).data(data);

    // just render nothing into this area of the page since the dynamic template
    // will do the actual rendering into the right region.
    return null;
  }
}));

/**
 * Let people use Layout directly from their templates!
 *
 * Example:
 *  {{#Layout template="MyTemplate"}}
 *    Main content goes here
 *
 *    {{#contentFor "footer"}}
 *      footer goes here
 *    {{/contentFor}}
 *  {{/Layout}}
 */
UI.registerHelper('Layout', UI.Component.extend({
  render: function () {
    var layout = new Layout({
      template: this.lookup('template'),
      data: this.lookup('data'),
      content: this.__content
    });

    return layout.create();
  }
}));

/**
 * Namespacing
 */
Iron = Iron || {};
Iron.Layout = Layout;
