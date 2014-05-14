# *****************************************************
# iron-router for reaction commerce
# see: https://github.com/EventedMind/iron-router
# iron router handles url path, and renders templates into
# yields based on the logic in this file
# individual reaction packages have their own router.js
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

# *****************************************************
# router path maps
# *****************************************************

Router.map ->
  # index page
  @route "index",
    controller: ReactionController
    path: "/"
    template: "products"
    onAfterAction: ->
      document.title = Shops.findOne()?.name

  # generic static pages
  for page in staticPages
    @route page,
      controller: ReactionController

  # custom 404 Page
  @route "notFound",
    path: "*"


