if Meteor.isServer
  Meteor.startup ->
    if CountStats.find().fetch().length is 0
      
      #console.log("Capture observer adding initial countstats");
      
      #console.log("Capture observer changed initial countstats");
      updateSlug = (id) ->
        curdoc = Captures.findOne(id)
        myDate = curdoc.submitted
        captureDate = new Date(myDate.getFullYear() + "-" + (myDate.getMonth() + 1) + "-" + myDate.getDate())
        CountStats.update
          campaignId: curdoc.campaignId
          submitted: captureDate
        ,
          $inc:
            count: 1
        ,
          upsert: true

      cursor = Captures.find()
      statsObserver = cursor.observeChanges(
        added: (id, fields) ->
          updateSlug id

        changed: (id, fields) ->
          updateSlug id
      )

