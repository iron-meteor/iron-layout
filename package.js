Package.describe({
  name: 'iron-layout',
  summary: 'Dynamic layouts which enable rendering dynamic templates into regions on a page.',
  version: '0.1.0',
  githubUrl: 'https://github.com/eventedmind/iron-layout'
});

Package.on_use(function (api) {
  api.use('ui');

  // for utils like Meteor._inherits
  api.use('meteor');

  // some utils
  api.use('underscore');

  // dynamic templates
  api.use('iron-dynamic-template');

  // if you use iron-layout you should get iron-dynamic-template for free!
  api.imply('iron-dynamic-template');

  // if blaze-layout make sure it loads first so we can clean up after it.
  api.use('blaze-layout', {weak: true});

  api.add_files('blaze_layout_errors.js', ['client', 'server']);
  api.add_files('layout.js', 'client');

  api.export('Iron', 'client');
});

Package.on_test(function (api) {
  api.use('iron-layout');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('templating');

  api.add_files('layout_test.html', 'client');
  api.add_files('layout_test.js', 'client');
});
