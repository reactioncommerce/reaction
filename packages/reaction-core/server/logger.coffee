###
# configure bunyan logging module for reaction server
# See: https://github.com/trentm/node-bunyan#levels
###
isDebug = Meteor.settings.isDebug

# acceptable levels
levels = ["FATAL","ERROR","WARN", "INFO", "DEBUG", "TRACE"]

# if debug is true, or NODE_ENV development environment and not false
# set to lowest level, or any defined level set to level
if isDebug is true or ( process.env.NODE_ENV is "development" and isDebug isnt false )
  # set logging levels from settings
  if typeof isDebug isnt 'boolean' and typeof isDebug isnt 'undefined' then isDebug = isDebug.toUpperCase()
  unless _.contains levels, isDebug
    isDebug = "WARN"

# Define bunyan levels and output to Meteor console
# init logging stream
if process.env.VELOCITY_CI is "1" #format screws with testing output
  formatOut = process.stdout
else
  formatOut = logger.format({ outputMode: 'short', levelInString: false})

# enable logging
ReactionCore.Events = logger.bunyan.createLogger(
  name: 'core'
  stream: (unless isDebug is "DEBUG" then formatOut else process.stdout )
  level: 'debug')

# set bunyan logging level
ReactionCore.Events.level(isDebug)
