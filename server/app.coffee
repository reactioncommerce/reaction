root = exports ? this

Meteor.app = _.extend(Meteor.app || {},
  getCurrentShopCursor: (client) ->
    domain = Meteor.app.getDomain(client)
    cursor = Shops.find({domains: domain}, {limit: 1});
    if !cursor.count()
      cursor = Shops.find({}, {sort: {$natural: 1}, limit: 1});
    cursor
  getCurrentShop: (client) ->
    cursor = Meteor.app.getCurrentShopCursor(client)
    cursor.fetch()[0]
  getDomain: (client) ->
    # Pass client in publish functions as "this"
    if !client
      for own sessionId, session of Meteor.default_server.sessions
        if session.userId == Meteor.userId()
          client = {
            _session: session
          }
    if !client then throw "Could not find current session"
    root.get_http_header(client, 'host').split(':')[0]
)

