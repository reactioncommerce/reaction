# Glossary
graphs: provide dashboard graphs (there can be many, per package)

control panel: the first card in the package drawer, used as nav element

widgets: widgets are cards displayed within package drawer to the right of control panel

app navbar:  if has widget = true display navigation to package below cards

# registration parameters

depends : analytics (this could be many analytics / any analtics but there must be one of these installed)

hidden = dont show anywhere

hasWidget = is an app, has dashboard widgets, shows as new nav in dashboard

template = modal template, give modal same id as template name displays in dashboard control panel, if provided standard panel does not display

settingsRoute = path to setting page,will use this for Route.go() and render to main

overviewRoute = route to some functional page / first page



Development:

use <div class="dashboard-widget">  for widget cards.
