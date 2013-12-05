root = exports ? this

# *****************************************************
# general helper for handling of error messages
# inserts views/includes/errors.html
# usage:  throwError("message");  (to display)
#         clearsErrors();         (to clear)
# *****************************************************
root.Errors = new Meteor.Collection(null)
throwError = (message) ->
  $.pnotify
    title: "Error"
    text: message
    type: "error"

  Errors.insert
    message: message
    seen: false


root.clearErrors = ->
  Errors.remove seen: true
