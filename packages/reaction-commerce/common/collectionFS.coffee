
@FileStorage = new FS.Collection("FileStorage",stores: [ new FS.Store.FileSystem("files", path: ".fileStorage") ])
FileStorage = @FileStorage

gridfs = new FS.Store.GridFS("gridfsmedia",
  # transformWrite: (fileObj, readStream, writeStream) ->

  #   # Store 10x10 px images
  #   @gm(readStream, fileObj.name).resize("10", "10").stream().pipe writeStream
  #   return
)

# To pass through stream:
#readStream.pipe(writeStream);
thumbnails = new FS.Store.FileSystem("thumbnails",
  path: ".thumbnails"
  # transformWrite: (fileObj, readStream, writeStream) ->

  #   # Store 10x10 px images
  #   @gm(readStream, fileObj.name).resize("10", "10").stream().pipe writeStream
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