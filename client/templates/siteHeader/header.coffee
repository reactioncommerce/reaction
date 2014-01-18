# *****************************************************
# returns "active" if we are on the current route
# we can use this in a class to mark current active nav
# *****************************************************

Template.siteHeader.helpers
  activeRouteClass: ->
    args = Array::slice.call(arguments, 0)
    args.pop()
    active = _.any(args, (name) ->
      location.pathname is Router.path(name)
    )
    active and "active"
  siteName: () ->
    siteName = Shops.findOne().name
    siteName


Template.siteHeader.events
  'click #login-dropdown-list a.dropdown-toggle': () ->
    setTimeout (->
      $("#login-email").focus()
    ), 100

  'click .cart-icon': () ->
    $("#cart-drawer").fadeToggle "slow", "linear"