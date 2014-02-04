# *****************************************************
# general helper for handling of error messages
# inserts views/includes/errors.html
# usage:  throwAlert("message");  (to display)
#         clearsErrors();         (to clear)
# *****************************************************
share.Errors = @Errors = new Meteor.Collection(null)
@throwAlert = (message,title,type) ->
  message = "An error has occurred" unless message
  title = "Error Notice" unless title
  type = "error" unless type
  delay = 2000
  closer = false
  animate_speed: "normal"
  addclass = "stack-bottomright"

  $.pnotify
    title: title
    text: message
    type: type

  Errors.insert
    message: message
    seen: false


@clearErrors = ->
  Errors.remove seen: true
