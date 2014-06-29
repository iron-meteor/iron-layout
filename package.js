Package.describe({
  summary: 'Dynamic layouts'
});

Package.on_use(function (api) {
  api.use('ui');
  api.use('spacebars');
  api.use('jquery')
  api.use('deps');
  api.use('templating');

  api.add_files('iron_layout.html', 'client');
  api.add_files('iron_layout.js', 'client');
});

Package.on_test(function (api) {
  api.use('iron-layout');
  api.use('tinytest');
  api.use('test-helpers');

  api.add_files('iron_layout_test.js', 'client');
});
