Meteor.app = _.extend(Meteor.app,
  getCurrentShop: (client) ->
    Shops.findOne({domains: Meteor.app.getDomain(client)});
  getDomain: (client) ->
    # Pass client in publish functions as "this"
    if !client
      for own sessionId, session of Meteor.default_server.sessions
        if session.userId == Meteor.userId()
          client = {
            _session: session
          }
    if !client then throw "Could not find current session"
    get_http_header(client, 'host').split(':')[0]
)

