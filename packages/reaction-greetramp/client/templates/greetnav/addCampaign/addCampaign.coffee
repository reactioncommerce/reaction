# Control add campaign modal submission
Template.addCampaign.events "submit form": (event) ->
  event.preventDefault()
  campaign =
    url: $(event.target).find("[name=url]").val()
    title: $(event.target).find("[name=title]").val()

  Meteor.call "campaign", campaign, (error, id) ->
    if error
      
      # display the error to the user
      throwError error.reason
      
      # if the error is that the campaign already exists, take us there
      console.log "error saving campaign"  if error.error is 302
    else
      $("#createCampaign").modal "hide"


