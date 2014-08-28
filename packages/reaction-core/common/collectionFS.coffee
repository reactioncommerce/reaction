
ReactionCore.Collections.FileStorage = new FS.Collection "FileStorage",
  stores: [ new FS.Store.GridFS("docfiles") ]

ReactionCore.Collections.Media = new FS.Collection "media",
  stores: [
    new FS.Store.GridFS("image"), #default unaltered image
    new FS.Store.GridFS("large", #large PDP image
      transformWrite: (fileObj, readStream, writeStream) ->
        if gm.isAvailable  # requires installation of imagemagick
          # Store 1000x1000 px images for the products
          gm(readStream, fileObj.name).resize("1000", "1000").stream().pipe writeStream
        else
          readStream.pipe(writeStream);
        return
    ),
    new FS.Store.GridFS("medium", #large PDP image
      transformWrite: (fileObj, readStream, writeStream) ->
        if gm.isAvailable  # requires installation of imagemagick
          # Store 600x600 px images for the product grids (optional)
          gm(readStream, fileObj.name).resize("600", "600").stream().pipe writeStream
        else
          readStream.pipe(writeStream);
        return
    ),
    new FS.Store.GridFS("small", #cart image
      transformWrite: (fileObj, readStream, writeStream) ->
        if gm.isAvailable # requires installation of imagemagick
          # Store 235x235 px images for the cart
          gm(readStream).resize("235", "235" + '^').gravity('Center').extent("235", "235").stream('PNG').pipe(writeStream);
        else
          readStream.pipe(writeStream);
        return
    ),
    new FS.Store.GridFS("thumbnail", #checkout & admin image
      transformWrite: (fileObj, readStream, writeStream) ->
        if gm.isAvailable # requires installation of imagemagick
          # Store 100x100 px images for the cart
          gm(readStream).resize("100", "100" + '^').gravity('Center').extent("100", "100").stream('PNG').pipe(writeStream);
        else
          readStream.pipe(writeStream);
        return
    )
  ]
  filter:
    allow:
      contentTypes: ["image/*"]
