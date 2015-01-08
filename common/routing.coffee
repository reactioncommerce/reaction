# *****************************************************
# iron-router for reaction commerce
# see: https://github.com/EventedMind/iron-router
# iron router handles url path, and renders templates into
# yields based on the logic in this file
# individual reaction packages have their own routing
#
# The reaction-core controller is extended here so you can
# modify here if needed.
# *****************************************************
ReactionController = ShopController.extend

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
#   Router.routes.index.options.template = "myIndex"
#
# or to change core controllers (and layouts) on a route:
#
#   Router.routes.index.controller = ReactionController
#
# You can also use the Template extensions to extend / alter core templates (see footer and layout as examples)
#
#   Template.layout.replaces "coreLayout"
#
# *****************************************************

Router.map ->
  # generic static pages
  for page in staticPages
    @route page,
      controller: ReactionController
      name: page

  # custom 404 Page
  @route "notFound",
    path: "/(.*)"