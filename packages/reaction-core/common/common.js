
/*
 * Common settings for CollectionFS
 */

(function() {
  FS.HTTP.setBaseUrl('/assets');

  FS.HTTP.setHeadersForGet([['Cache-Control', 'public, max-age=31536000']]);

}).call(this);
