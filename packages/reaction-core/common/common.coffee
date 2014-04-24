###
# Common settings for CollectionFS
###
FS.HTTP.setBaseUrl('/assets')

FS.HTTP.setHeadersForGet([
  ['Cache-Control', 'public, max-age=31536000']
])
