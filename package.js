Package.describe({
  summary: 'Dynamic layouts which enable rendering dynamic templates into regions on a page.',
  version: '0.4.0-blaze-preview',
  git: 'https://github.com/eventedmind/iron-layout'
});

Package.on_use(function (api) {
  api.versionsFrom('METEOR@0.9.0.1-blaze-preview');

  // so our default_layout gets compiled
  api.use('templating');
  api.use('blaze');

  // some utils
  api.use('underscore')

  api.use('iron:core@0.3.2');
  api.imply('iron:core');

  // dynamic templates
  api.use('iron:dynamic-template@0.4.0');

  // if you use iron-layout you should get iron-dynamic-template for free!
  api.imply('iron:dynamic-template');

  // error messages to remove old packages
  api.use('cmather:blaze-layout@0.2.5', {weak: true});
  api.use('cmather:iron-layout@0.2.0', {weak: true});

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
