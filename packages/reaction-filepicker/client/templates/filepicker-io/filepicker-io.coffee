Template["filepicker-io"].helpers pickerData: ->
  Packages.findOne name: "reaction-filepicker"

Template["filepicker-io"].events
  "submit form": (event) ->
    event.preventDefault()
    apikey = $(event.target).find("[name=input-apikey]").val()
    packageConfig = Packages.findOne(name: "reaction-filepicker")
    Packages.update
      _id: packageConfig._id
    ,
      $set:
        apikey: apikey
    # TODO: Validate key with filepicker before adding
    # throwAlert("Success");
    Alerts.add "Saved \"" + apikey + "\"", "success"
    Router.go "dashboard"

  "click .cancel": (event) ->
    history.go -1
    false

