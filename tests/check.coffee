_ = require("underscore")

module.exports = (callback) ->
  (error) ->
    if error
      console.log(error.orgStatusMessage)
      throw error
    if callback
      newArguments = _.toArray(arguments).slice(1)
      return callback.apply(@, newArguments)
