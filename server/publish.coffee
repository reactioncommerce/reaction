ServerSessions = new Meteor.Collection("ReactionSessions")
Meteor.publish "ReactionSessions", (id) ->
  created = new Date().getTime()
  
  # If no id is passed we create a new session
  id = ServerSessions.insert(created: created)  unless id
  
  # Load the session
  serverSession = ServerSessions.find(id)
  
  # If no session is loaded, creates a new one;
  # id no longer valid
  if serverSession.count() is 0
    id = ServerSessions.insert(created: created)
    serverSession = ServerSessions.find(id)
  serverSession

