# *****************************************************
# iron-router for reaction commerce
# see: https://github.com/EventedMind/iron-router
# iron router handles url path, and renders templates into
# yields based on the logic in this file
# individual reaction packages have their own router.js
# *****************************************************
Router.configure
  layoutTemplate: "siteLayout"
  notFoundTemplate: "notFound"
  loadingTemplate: "loading"
  yieldTemplates:
    siteHeader:
      to: "header"

    siteFooter:
      to: "footer"

    dashboardSidebar:
      to: "sidebar"


# *****************************************************
# generic routes for reaction marketing site layout
# default layout is dashboardLayout template, these
# are all exceptions
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
    path: "/"
    layoutTemplate: "siteLayout"

  i = 0

  while i < pages.length
    @route pages[i],
      layoutTemplate: "siteLayout"

    i++
  
  # 404 Page for reaction
  @route "notFound",
    path: "*"
    layoutTemplate: "siteLayout"


