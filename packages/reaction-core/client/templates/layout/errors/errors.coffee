# *****************************************************
# global error handling display
# defines errors in a client side collection
#
# *****************************************************
Template.errors.helpers errors: ->
  Errors.find()

Template.error.rendered = ->
  error = @data
  Meteor.defer ->
    Errors.update error._id,
      $set:
        seen: true
