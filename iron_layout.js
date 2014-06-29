// XXX UI.dynamic
//  - doesn't give us a ton of value since we have to override verything anyway
//  - need ability to get template content OR a name of a template
// XXX global yield and contentFor helpers
// XXX gid rid of global data context. Replace with a per region data context
// that gets set at render time.
// XXX Can we use UI.dynamic instead of a custom thingy?
// XXX clean up all regions if you change the layout
// XXX give the layout a data context too!

var templateInstance = function () {
  return UI._templateInstance();
};

var componentInstance = function () {
  var tmpl = templateInstance();

  if (!tmpl || !tmpl.__component__)
    throw new Error("No component instance found.");

  return tmpl.__component__;
};

var findComponentOfKind = function (cmp, kind) {
  while (cmp) {
    if (cmp.kind === kind)
      return cmp;
    else
      cmp = cmp.parent;
  }

  return undefined;
};

var findComponentWithProperty = function (cmp, prop) {
  while (cmp) {
    if (cmp[prop])
      return cmp;
    else
      cmp = cmp.parent;
  }

  return undefined;
};

var lookupPropertyValue = function (cmp, prop) {
  var cmp = findComponentWithProperty(cmp, prop);

  if (!cmp)
    throw new Error("No component found with property '" + prop + ".'");

  return cmp[prop];
};

var apply = function (cmp, method, args) {
  var cmp = findComponentWithProperty(cmp, method);

  if (!cmp)
    throw new Error("No component found with method '" + method + ".'");

  return cmp[prop].apply(cmp, args || []);
};

/**
 * This must return the name of a template which is defined on the Template
 * namespace. So in order to provie dynamic content like {{> UI.contentBlock}}
 * we'll have to assign the content to a new template with a unique random name.
 * Maybe we have the notion of "types" in the lookup. If it's of type anonymous,
 * we create a new component with a random id and attach to the Template
 * namespace.
 *
 */
var getRegionTemplate = function (cmp, name) {
  console.log('getRegionTemplate: ', cmp, JSON.stringify(name));
  return Session.get('template_' + name);
};

var getRegionData = function (cmp, name) {
  console.log('getRegionData: ', cmp, JSON.stringify(name));
  return Session.get('data_' + name);
};

var createDynamicRegion = function (cmp, name) {
  return Spacebars.TemplateWith(function () {
    return {
      template: getRegionTemplate(cmp, name),
      data: getRegionData(cmp, name)
    }
  }, UI.block(function () {
    return Spacebars.include(function () {
      return Template.__dynamic;
    });
  }));
};

UI.registerHelper('yield', function () {
  var options = this;
  var cmp = componentInstance();
  var regionName;
  var regionComponent;
  
  if (_.isString(options))
    regionName = options;
  else if (_.isObject(options))
    regionName = options.region;
  else
    regionName = 'main';
  
  return createDynamicRegion(cmp, regionName);
});
