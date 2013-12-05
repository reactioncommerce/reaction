# *****************************************************
# global error handling display
# defines errors in a client side collection
#
# files:
# client/helpers/errors.js
# views/includes/errors.html
# views/includes/errors.js
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


