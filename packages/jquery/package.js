Package.describe({
  summary: "Manipulate the DOM using CSS selectors - jQuery 2.1.0"
});

Package.on_use(function (api) {
  api.use('build-fetcher', 'client');
  api.add_files('jquery.fetch.json', 'client');
  api.add_files('post.js', 'client');

  api.export('$', 'client');
  api.export('jQuery', 'client');
});
