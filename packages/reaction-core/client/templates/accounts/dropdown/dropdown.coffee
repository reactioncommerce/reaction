Template.loginDropdown.events
  "click .dropdown-menu": (event) ->
    event.stopPropagation()

  "click #logout": (event, template) ->
    Session.set 'displayConsoleNavBar', false
    Meteor.logout (err) ->
      Meteor._debug err if err
    event.preventDefault()
    template.$('.dropdown-toggle').dropdown('toggle') # close dropdown

  "click .user-accounts-dropdown-apps a": (event, template) ->
    if @.route is "createProduct"
      event.preventDefault()
      event.stopPropagation()
      Meteor.call "createProduct", (error, productId) ->
        if error
          throw new Meteor.Error("createProduct error", error)
        else if productId
          # add the current Tag selected tag when creating the product
          currentTagId  = Session.get "currentTag"
          currentTag = ReactionCore.Collections.Tags.findOne(currentTagId)
          if currentTag then Meteor.call("updateProductTags", productId, currentTag.name, currentTagId)
          # goto the created product.
          Router.go "product",
            _id: productId
          return
      return
    else if @.route
      event.preventDefault()
      template.$('.dropdown-toggle').dropdown('toggle') # close dropdown
      Router.go(@.route)
