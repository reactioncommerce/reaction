# *****************************************************
# iron-router for reaction commerce
# see: https://github.com/EventedMind/iron-router
# iron router handles url path, and renders templates into
# yields based on the logic in this file
# individual reaction packages have their own routing
# *****************************************************

ReactionController = ShopController.extend
  layoutTemplate: "layout"

# *****************************************************
# generic static pages
# an array of pages, so we don't have to write each one
# *****************************************************

staticPages = [
  #Footer
  "about"
  "team"
  "faqs"
  "terms"
  "privacy"
]

###
# router path maps
###

# *****************************************************
# to use your own templates, you can do override like this:
#
# Router.routes.index.options.template = "myIndex"
#
# or to change core controllers (and layouts) on a route:
#
# Router.routes.index.controller = ReactionController
# *****************************************************

Router.map ->
  # generic static pages
  for page in staticPages
    console.log page
    @route page,
      controller: ReactionController

  # custom 404 Page
  @route "notFound",
    path: "*"