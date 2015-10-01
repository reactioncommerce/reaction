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
  // if we don't have a sessionId create
  // a new session

  if (!id) {
    id = ServerSessions.insert({
      created: created
    });
  }
  // get the session from existing sessionId
  serverSession = ServerSessions.find(id);

  // if not found, also create a new session
  if (serverSession.count() === 0) {
    id = ServerSessions.insert({
      created: created
    });
  }

  // set global sessionId
  ReactionCore.sessionId = id;

  // return cursor
  return ServerSessions.find(id)
});
