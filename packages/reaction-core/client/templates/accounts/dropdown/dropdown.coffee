Template.loginDropdown.events
  "click .dropdown-menu": (event) ->
    event.stopPropagation()

  "click #logout": (event, template) ->
    Session.set 'displayConsoleNavBar', false
    Meteor.logout (err) ->
      Meteor._debug err if err
    event.preventDefault()
    template.$('.dropdown-toggle').dropdown('toggle') # close dropdown

  "click .user-accounts-dropdown a": (event, template) ->
    if @.route is "createProduct"
      event.preventDefault()
      Meteor.call "createProduct", (error, productId) ->
        if error
          console.log error
        else if productId
          Router.go "product",
            _id: productId
          return
      return
    else if @.route
      event.preventDefault()
      template.$('.dropdown-toggle').dropdown('toggle') # close dropdown
      Router.go(@.route)
