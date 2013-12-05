# Control add broadcast modal submission
Template.addBroadcast.events
  "submit form": (event) ->
    event.preventDefault()
    campaignId = Session.get("currentCampaignId")
    broadcast =
      title: $(event.target).find("[name=title]").val()
      url_match: $(event.target).find("[name=url_match]").val()
      start: $(event.target).find("[name=start]").val()
      end: $(event.target).find("[name=end]").val()
      html: $(event.target).find("[name=html]").val()

    Meteor.call "broadcast", broadcast, campaignId, (error, id) ->
      if error
        
        # display the error to the user
        throwError error.reason
        
        # if the error is that the broadcast already exists, take us there
        console.log "error saving broadcast"  if error.error is 302
      else
        $(".broadcast-form").hide().height "0"


  "click #broadcastClose": (event) ->
    $(".broadcast-form").hide().height "0"

  "click .close": (event) ->
    $(".broadcast-form").hide().height "0"

