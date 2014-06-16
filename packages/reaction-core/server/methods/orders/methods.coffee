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
  createPDF: (url, orderId) ->
    @unblock()
    phantomServer = Npm.require "phantomjs"
    phantom = Npm.require 'node-phantom'
    Future = Npm.require("fibers/future")
    future = new Future()

    currentUser = Meteor.userId()

    fileName = "reaction-orders-" + Date.now() + ".pdf"
    filePath = process.env.PWD + "/.fileStorage/" + fileName
    url = "http://" + this.connection.httpHeaders.host + url

    console.log "Creating PDF for #{url}"

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

    phantom.create (Meteor.bindEnvironment (err, ph) ->
      if err 
        throw err
      else
        # Create a new page synchronously
        page = Meteor._wrapAsync(ph.createPage.bind ph)();
        # Set paper size synchronously
        Meteor._wrapAsync(page.set.bind page)("paperSize", paperSize)
        # page.zoomFactor = 1.5
        # Check status
        status = Meteor._wrapAsync(page.open.bind page)(url)
        if status isnt "success"
          ph.exit()
          throw new Error "Unable to access network"
        
        # Create function that will be called after
        # we have let the page load and retrieved the clipRect
        finish = (err, clipRect) ->
          console.log "clipRect", clipRect
          # Set clip area synchronously
          Meteor._wrapAsync(page.set.bind page)("clipRect", clipRect)
          console.log "clipRect is set to", Meteor._wrapAsync(page.get.bind page)("clipRect")
          # Render the page synchronously
          Meteor._wrapAsync(page.render.bind page)(filePath)
          # We're done with phantom now
          ph.exit()
          # Save the generated PDF file with metadata using CollectionFS
          fileObj = new FS.File(filePath)
          fileObj.owner = currentUser
          fileObj.metadata =
            orderId: orderId
          doc = FileStorage.insert fileObj
          # Finally return (from the method) the new document ID
          future.return doc._id

        finish = Meteor.bindEnvironment finish

        dataIsLoaded = ->
          f = new Future()
          page.evaluate (e) ->
            if Meteor?.status?().connected
              Deps.flush()
              return DDP._allSubscriptionsReady()
            else
              return false
          , (err, ready) ->
            # This never returns true because DDP._allSubscriptionsReady() never returns true for some reason
            if ready then console.log "ready", ready
            f.return ready
          f.wait()
        
        dataIsLoaded = Meteor.bindEnvironment dataIsLoaded

        getPrintArea = ->
          document.getElementById('print-area').getBoundingClientRect()

        # Wait for page and async data to be loaded
        #waitFor ph, dataIsLoaded, ->
        #  page.evaluate getPrintArea, finish
        #, 120000

        # After waiting for async loading of data, call evaluate to get the clip region
        Meteor.setTimeout ->
          page.evaluate getPrintArea, finish
        , 5000
    ),
    # Tell phantom.create call where to find phantom binary
    phantomPath: phantomServer.path

    future.wait()