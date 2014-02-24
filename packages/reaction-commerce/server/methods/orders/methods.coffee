Meteor.methods
  addTracking: (orderId, tracking, variantId) ->
    Orders.update(orderId, {$set: {"shipping.shipmentMethod.tracking":tracking}})

  updateWorkflow: (orderId, currentState) ->
    Orders.update(orderId, {$set: {"state":currentState}})

  updateDocuments: (orderId, docId, docType) ->
    Orders.update orderId,
      $addToSet:
        "documents":
          docId: docId
          docType: docType

  updateHistory: (orderId, event, value) ->
    Orders.update orderId,
      $addToSet:
        "history":
          event: event
          value: value
          userId: Meteor.userId()
          updatedAt: new Date()

  createPDF: (url) ->
    Future = Npm.require("fibers/future")
    fs = Npm.require('fs')
    phantomServer = Npm.require "phantomjs"
    phantom = Npm.require 'node-phantom'
    path = Npm.require("path")
    future = new Future()

    process.env.PATH += ":" + path.dirname(phantomServer.path)
    fileName = process.env.PWD + "/.fileStorage/reaction-orders-" + Date.now() + ".pdf"
    url = "http://localhost:3000" +url

    # updateStorage = Meteor._wrapAsync(FileStorage.insert(file:data))
    #PDF Formatting
    paperSize =
      format: "Letter"
      orientation: "portrait"
      margin:
        left: "2.5cm"
        right: "2.5cm"
        top: "1cm"
        bottom: "1cm"

    phantom.create ((err, ph) ->
      ph.createPage (err, page) ->
        page.set "paperSize",paperSize
        # page.zoomFactor = 1.5
        page.open url, (err,status) ->
          if status isnt "success"
            console.log "Unable to access network"
          else
            setTimeout (->
              page.evaluate ((s) ->
                clipRect = document.getElementById('print-area').getBoundingClientRect()
                page.set "clipRect", clipRect
              ), ((err, clipRect) ->
                # this should work, but doesn't but leaving in case someday it does
                #page.set "clipRect", clipRect
              ), "clipRect"

              page.render fileName
              ph.exit()
            ), 1000
            setTimeout (->
              future.return("rendered")
            ), 1500
      return
    )

    if future.wait()
      fileData = fs.readFileSync fileName, "base64"
      FileStorage.insert(file:fileData)