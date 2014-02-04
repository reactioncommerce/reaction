# Install a ghost listener so we can spy on the client headers.
install_spy = ->

  # Surplant the current request and upgrade listeners.
  server = WebApp.httpServer
  _.each [
    "request"
    "upgrade"
  ], (event) ->
    old_listeners = server.listeners(event).slice(0)
    server.removeAllListeners event
    listener = (req) ->
      args = arguments
      request_url = req.url.split("/")

      # If url is a sockjs (non-info) url, get the sockjs server/client id and save the headers.
      if request_url[1] is "sockjs" and request_url[2] isnt "info"
        sockjs_id = request_url.slice(2, 4).join("/")
        storage[sockjs_id] =
          headers: req.headers
          remote_ip: req.connection.remoteAddress
          time: +(new Date)

        clean()

      # Call the old listeners (meteor).
      for old in old_listeners
        if old.apply
            old.apply server, args



    # Hook us up.
    server.addListener event, listener


###
Get a http header from a client handle.

@param client The client handle (eg: "this" from within a publish call).
@param header The header name to retrieve.
@return String The header content.
###

###
Get remote ip address from a client handle.

@param client The client handle (eg: "this" from within a publish call).
@param direct Whether to not use the forwarded-for header.
@return String The header content.
###
get_sockjs_id = (client) ->
  if client._session and client._session.socket
    request_url = client._session.socket.url.split("/")
    return request_url.slice(2, 4).join("/")
  false

# Clean out expired entries from the store.
clean = ->
  n = +(new Date)
  keep = []
  last_clean = n  if last_clean is 0

  # only clean once every 5 minutes
  return  if n - last_clean < 300000
  for v, k of storage
    delta = n - v.time
    keep.push k  if delta < 5000

  keep.unshift storage
  storage = _.pick.apply(_, keep)
  last_clean = n
storage = {}
get_http_header = (client, header) ->
  sockjs_id = get_sockjs_id(client)
  storage[sockjs_id].headers[header]  if sockjs_id and storage[sockjs_id]

get_http_remote_ip = (client, direct) ->
  sockjs_id = get_sockjs_id(client)
  if storage[sockjs_id]
    ip = storage[sockjs_id].remote_ip
    return ip  if direct
    fwd = storage[sockjs_id].headers["x-forwarded-for"]
    if fwd
      fwd = fwd.split(/\s*,\s*/)
      ip = fwd[0]
    ip

last_clean = 0

share.get_http_header = get_http_header
