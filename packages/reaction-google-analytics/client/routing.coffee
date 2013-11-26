Router.map ->
  @route "googleAnalytics"

Router.after ->
  ga('send', 'pageview', IronLocation.get().pathname)
