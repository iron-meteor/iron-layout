Package.describe({
  summary: 'Dynamic layouts'
});

Package.on_use(function (api) {
  api.use('ui');
  api.use('spacebars');
  api.use('jquery')
  api.use('deps');
  api.use('templating');
  api.use('iron-dynamic-template');
  api.add_files('layout.js', 'client');
  api.export('Iron', 'client');
});

Package.on_test(function (api) {
  api.use('iron-layout');
  api.use('tinytest');
  api.use('test-helpers');
});
