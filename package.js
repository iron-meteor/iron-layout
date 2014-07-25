Package.describe({
  summary: 'Dynamic layouts which enable rendering dynamic templates into regions on a page.',
  version: '0.2.0',
  git: 'https://github.com/eventedmind/iron-layout'
});

Package.on_use(function (api) {
  // so our default_layout gets compiled
  api.use('templating');

  api.use('ui');

  // for utils like Meteor._inherits
  api.use('meteor');

  // some utils
  api.use('underscore');

  api.use('iron-core');
  api.imply('iron-core');

  // dynamic templates
  api.use('iron-dynamic-template');

  // if you use iron-layout you should get iron-dynamic-template for free!
  api.imply('iron-dynamic-template');

  // if blaze-layout make sure it loads first so we can clean up after it.
  api.use('blaze-layout', 'client', {weak: true});

  api.add_files('blaze_layout_errors.js', ['client', 'server']);
  api.add_files('default_layout.html', 'client');
  api.add_files('layout.js', 'client');
});

Package.on_test(function (api) {
  api.use('iron-layout');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('templating');
  api.use('deps');

  api.add_files('layout_test.html', 'client');
  api.add_files('layout_test.js', 'client');
});
