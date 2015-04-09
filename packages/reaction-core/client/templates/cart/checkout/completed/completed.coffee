Template.cartCompleted.helpers
  orderStatus: () ->
    status = this?.status || "processing"
    if status is "new" then status = i18n.t('cartCompleted.submitted')
    return status

Template.cartCompleted.events
  'click #update-order': (event, template) ->
    email = template.find("input[name=email]").value
    check email, String
    #todo email validation, update error handling.
    Meteor.call "addOrderEmail", Template.parentData()._id, email
