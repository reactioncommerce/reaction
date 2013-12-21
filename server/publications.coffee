Meteor.publish 'SystemConfig', ->
  SystemConfig.find({})

# *****************************************************
# Client access rights for SystemConfig
# *****************************************************
SystemConfig.allow
  insert: (userId, doc) ->
    # the user must be logged in, and the document must be owned by the user
    #return (userId && doc.owner === userId);
    true
  update: (userId, doc, fields, modifier) ->
    # can only change your own documents
    true
    #return doc.owner === userId;
  remove: (userId, doc) ->
    # can only remove your own documents
    doc.owner is userId
  #fetch: ['owner']

ServerSessions = new Meteor.Collection("ReactionSessions")
Meteor.publish 'ReactionSessions', (id) ->
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

