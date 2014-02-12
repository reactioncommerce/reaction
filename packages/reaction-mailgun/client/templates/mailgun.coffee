Template.mailgun.helpers

  portOptions: [
    {label: "25", value: 25}
    {label: "587", value: 587}
    {label: "465", value: 465}
    {label: "475", value: 475}
    {label: "2525", value: 2525}
  ]

  packageData: ->
    return Packages.findOne({name:"reaction-mailgun"})
  mailgunSettingsForm: ->
    mailgunSettingsForm = new AutoForm MailgunSettingsSchema
    mailgunSettingsForm.hooks
      onSubmit: (insertDoc,updateDoc,currentDoc) ->
        if updatePackage(updateDoc)
          throwAlert "Mailgun","Settings saved ", "success"
    mailgunSettingsForm

updatePackage = (updateDoc) ->
  packageId = Packages.findOne({name:"reaction-mailgun"})._id
  Packages.update packageId, updateDoc,(error,result) ->
    return false if error
  return true
