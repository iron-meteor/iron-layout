Package.describe({
  summary: 'Dynamic layouts with regions.'
});

Package.on_use(function (api) {
  api.use('ui');

  // for utils like Meteor._inherits
  api.use('meteor');

  // dynamic templates
  api.use('iron-dynamic-template');

  api.add_files('layout.js', 'client');

  api.export('Iron', 'client');
});

Package.on_test(function (api) {
  api.use('iron-layout');
  api.use('tinytest');
  api.use('test-helpers');
});
