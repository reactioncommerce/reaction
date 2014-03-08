# *****************************************************
# iron-router for reaction commerce
# see: https://github.com/EventedMind/iron-router
# iron router handles url path, and renders templates into
# yields based on the logic in this file
# individual reaction packages have their own router.js
# *****************************************************
Router.configure
  layoutTemplate: "layout"
  # yieldTemplates:
  #   footer:
  #     to: "footer"
# *****************************************************
# generic routes for reaction layout
# *****************************************************
pages = [

  #Header
  "pricing"
  "contactus"

  #Footer
  "about"
  "team"
  "faqs"
  "terms"
  "privacy"
]

Router.map ->
  @route "index",
    controller: ShopController
    path: "/"
  for page in pages
    @route page
  # 404 Page for reaction
  @route "notFound",
    path: "*"


