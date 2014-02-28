Meteor.methods
  ###
  # Adds tracking information to order
  # Call after any tracking code is generated
  ###
  addTracking: (orderId, tracking, variantId) ->
    Orders.update(orderId, {$set: {"shipping.shipmentMethod.tracking":tracking}})

  ###
  # Save supplied order workflow state
  ###
  updateWorkflow: (orderId, currentState) ->
    Orders.update(orderId, {$set: {"state":currentState}})
    Meteor.call "updateHistory", orderId, currentState
  ###
  # Add files/documents to order
  # use for packing slips, labels, customs docs, etc
  ###
  updateDocuments: (orderId, docId, docType) ->
    Orders.update orderId,
      $addToSet:
        "documents":
          docId: docId
          docType: docType
  ###
  # Add to order event history
  ###
  updateHistory: (orderId, event, value) ->
    Orders.update orderId,
      $addToSet:
        "history":
          event: event
          value: value
          userId: Meteor.userId()
          updatedAt: new Date()
  ###
  # Finalize any payment where mode is "authorize"
  # and status is "approved", reprocess as "sale"
  ###
  processPayments: (orderId) ->
    order = Orders.findOne(orderId)
    for paymentMethod,index in order.payment.paymentMethod
      if paymentMethod.mode is 'authorize' and paymentMethod.status is 'approved'
        Meteor[paymentMethod.processor].capture paymentMethod.transactionId, paymentMethod.amount, (error,result) ->
          if result.capture?
            transactionId = paymentMethod.transactionId
            Orders.update { "_id": orderId, "payment.paymentMethod.transactionId": transactionId},
              $set: {
                "payment.paymentMethod.$.transactionId": result.capture.id
                "payment.paymentMethod.$.mode": "capture"
                "payment.paymentMethod.$.status": "completed"
              }
          result

  ###
  # Creates a pdf doc and attaches to order
  # for any existing site url (completed orders)
  ###
  createPDF: (url) ->
    Future = Npm.require("fibers/future")
    fs = Npm.require('fs')
    phantomServer = Npm.require "phantomjs"
    phantom = Npm.require 'node-phantom'
    path = Npm.require("path")
    future = new Future()

    process.env.PATH += ":" + path.dirname(phantomServer.path)
    fileName = "reaction-orders-" + Date.now() + ".pdf"
    filePath = process.env.PWD + "/.fileStorage/" + fileName
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

              page.render filePath
              ph.exit()
            ), 300
            setTimeout (->
              future.return("rendered")
            ), 1500
      return
    )

    if future.wait()
      fileData = fs.readFileSync filePath
      FileStorage.storeBuffer fileName, fileData,
        contentType: "application/pdf"
        owner: Meteor.userId()
        encoding: 'binary'