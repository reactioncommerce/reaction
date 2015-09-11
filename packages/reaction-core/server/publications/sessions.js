/**
 * Reaction Server / amplify permanent sessions
 * If no id is passed we create a new session
 * Load the session
 * If no session is loaded, creates a new one
 */

this.ServerSessions = new Mongo.Collection("Sessions");

Meteor.publish('Sessions', function(id) {
  var created, serverSession;
  check(id, Match.OneOf(String, null));
  created = new Date().getTime();
  if (!id) {
    id = ServerSessions.insert({
      created: created
    });
  }
  serverSession = ServerSessions.find(id);
  if (serverSession.count() === 0) {
    id = ServerSessions.insert({
      created: created
    });
    serverSession = ServerSessions.find(id);
  }
  ReactionCore.sessionId = id;
  return serverSession;
});
