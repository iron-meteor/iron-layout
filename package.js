Package.describe({
  summary: 'Dynamic layouts which enable rendering dynamic templates into regions on a page.',
  version: '0.3.0',
  git: 'https://github.com/eventedmind/iron-layout'
});

Package.on_use(function (api) {
  // so our default_layout gets compiled
  api.use('templating@1.0.0');

  api.use('ui@1.0.0');

  // for utils like Meteor._inherits
  api.use('meteor@1.0.0');

  // some utils
  api.use('underscore@1.0.0');

  api.use('iron:core@0.3.2');
  api.imply('iron:core');

  // dynamic templates
  api.use('iron:dynamic-template@0.3.0');

  // if you use iron-layout you should get iron-dynamic-template for free!
  api.imply('iron:dynamic-template');

  api.use('cmather:blaze-layout', {weak: true});
  api.use('cmather:iron-layout', {weak: true});

  api.add_files('version_conflict_errors.js');

  api.add_files('default_layout.html');
  api.add_files('layout.js');
});

Package.on_test(function (api) {
  api.use('iron:layout');
  api.use('tinytest');
  api.use('test-helpers');
  api.use('templating');
  api.use('deps');

  api.add_files('layout_test.html', 'client');
  api.add_files('layout_test.js', 'client');
});
