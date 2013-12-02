ServerSessions = new Meteor.Collection('ReactionSessions');

Meteor.publish('ReactionSessions', function(id) {
  var created = new Date().getTime();

  // If no id is passed we create a new session
  if(!id) {
    id = ServerSessions.insert({created: created});
  }

  // Load the session
  var serverSession = ServerSessions.find(id);

  // If no session is loaded, creates a new one;
  // id no longer valid
  if(serverSession.count() === 0) {
    id = ServerSessions.insert({created: created});
    serverSession = ServerSessions.find(id);
  }

  return serverSession;
});