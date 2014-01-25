
# *****************************************************
# Instantiates loadpicker and applies key
#
# *****************************************************
loadPicker = (callback) ->
  if (not window.filepicker.keyIsSet) and Roles.userIsInRole(Meteor.user(), "admin")
    throwError "You can do that on the <a href=\"/filepicker-io\">package dashboard</a>.","Filepicker.io is not configured"
    return false
  callback and callback()

filepickerLoadCallback = ->
  Meteor.startup ->
    Deps.autorun ->
      packageConfig = Packages.findOne(name: "reaction-filepicker")
      if packageConfig and packageConfig.apikey
        window.filepicker.setKey packageConfig.apikey
        window.filepicker.keyIsSet = true

#If the script doesn't load
filepickerErrorCallback = (error) ->
  console.log error  unless typeof console is `undefined`


#Generate a script tag
script = document.createElement("script")
script.type = "text/javascript"
script.src = "//api.filepicker.io/v1/filepicker.js"
script.onload = filepickerLoadCallback
script.onerror = filepickerErrorCallback

#Load the script tag
head = document.getElementsByTagName("head")[0]
head.appendChild script
