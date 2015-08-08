###
# See: https://github.com/meteor/meteor/issues/4793
###
if Meteor.isClient
  MeteorVersion = Meteor.release.replace(/[.@METRO]+/g, '')
  MeteorVersion += new Array(5 - (MeteorVersion.length)).join('0')
  if Number(MeteorVersion) <= 1103
    console.info '4793: Updating Tracker.Dependency.prototype.changed function'

    Tracker.Dependency::changed = ->
      self = this
      for id of self._dependentsById
        dependent = self._dependentsById[id]
        if dependent
          dependent.invalidate()
      return
