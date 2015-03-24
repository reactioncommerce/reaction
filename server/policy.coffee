###
# set browser policies
###

# allow google fonts (required for core-theme)
BrowserPolicy.content.allowFontDataUrl()
BrowserPolicy.content.allowOriginForAll("fonts.googleapis.com")
BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com")

# allow velocity testing (optional for velocity)
if process.env.NODE_ENV is 'development'
  BrowserPolicy.content.allowOriginForAll 'localhost:*'
  BrowserPolicy.content.allowConnectOrigin 'ws://localhost:5000'
  BrowserPolicy.content.allowConnectOrigin 'http://localhost:5000'
  BrowserPolicy.framing.allowAll()
