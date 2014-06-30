Package.describe({
  summary: 'Dynamic layouts'
});

Package.on_use(function (api) {
  api.use('ui');
  api.use('spacebars');
  api.use('jquery')
  api.use('deps');
  api.use('templating');

  api.add_files('dynamic-template/dynamic_template.js', 'client');
  api.add_files('layout/layout.js', 'client');

  api.export('Iron', 'client');
});

Package.on_test(function (api) {
  api.use('iron-layout');
  api.use('tinytest');
  api.use('test-helpers');

  api.add_files('iron_layout_test.js', 'client');
});
