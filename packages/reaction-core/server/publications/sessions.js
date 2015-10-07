/**
 * Reaction Server / amplify permanent sessions
 * If no id is passed we create a new session
 * Load the session
 * If no session is loaded, creates a new one
 */

this.ServerSessions = new Mongo.Collection("Sessions");

Meteor.publish("Sessions", function (sessionId) {
  check(sessionId, Match.OneOf(String, null));
  let created = new Date().getTime();
  // if we don"t have a sessionId create a new session
  if (!sessionId) {
    id = ServerSessions.insert({
      created: created
    });
  } else {
    id = sessionId;
  }
  // get the session from existing sessionId
  let serverSession = ServerSessions.find(id);

  // if not found, also create a new server session
  if (serverSession.count() === 0) {
    id = ServerSessions.insert({
      created: created
    });
  }

  // set global sessionId
  ReactionCore.sessionId = id;

  // return cursor
  return ServerSessions.find(id);
});
