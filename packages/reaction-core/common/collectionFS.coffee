
@FileStorage = new FS.Collection("FileStorage",stores: [ new FS.Store.GridFS("docfiles") ])
FileStorage = @FileStorage

gridfs = new FS.Store.GridFS("gridfsmedia",
  #   # requires installation of imagemagick
  # transformWrite: (fileObj, readStream, writeStream) ->
  #   # Store 1000x1000 px images for the products
  #   @gm(readStream, fileObj.name).resize("1000", "1000").stream().pipe writeStream
  #   return
)

# To pass through stream:
#readStream.pipe(writeStream);
thumbnails = new FS.Store.FileSystem("thumbnails",
  path: ".thumbnails"
  #   # requires installation of imagemagick
  # transformWrite: (fileObj, readStream, writeStream) ->
  #   # Store 235x235 px images for the cart
  #   @gm(readStream, fileObj.name).resize("235", "235").stream().pipe writeStream
  #   return
)


@Media = new FS.Collection("media",
  stores: [
    gridfs
    thumbnails
  ]
  filter:
    allow:
      contentTypes: ["image/*"]
)
Media = @Media