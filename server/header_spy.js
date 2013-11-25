var storage = {};

// Install a ghost listener so we can spy on the client headers.
function install_spy() {
  // Surplant the current request and upgrade listeners.
  var server = WebApp.httpServer;
  _.each(['request', 'upgrade'], function (event) {
    var old_listeners = server.listeners(event).slice(0);
    server.removeAllListeners(event);

    var listener = function (req) {
      var args = arguments,
        request_url = req.url.split('/');

      // If url is a sockjs (non-info) url, get the sockjs server/client id and save the headers.
      if (request_url[1] === 'sockjs' && request_url[2] !== 'info') {
        var sockjs_id = request_url.slice(2, 4).join('/');

        storage[sockjs_id] = {
          headers: req.headers,
          remote_ip: req.connection.remoteAddress,
          time: +(new Date)
        };

        clean();
      }

      // Call the old listeners (meteor).
      _.each(old_listeners, function (old) {
        old.apply(server, args);
      });
    };

    // Hook us up.
    server.addListener(event, listener);
  });
}

/**
 * Get a http header from a client handle.
 *
 * @param client The client handle (eg: "this" from within a publish call).
 * @param header The header name to retrieve.
 * @return String The header content.
 */
get_http_header = function (client, header) {
  var sockjs_id = get_sockjs_id(client);
  if (sockjs_id && storage[sockjs_id]) {
    return storage[sockjs_id].headers[header];
  }
};

/**
 * Get remote ip address from a client handle.
 *
 * @param client The client handle (eg: "this" from within a publish call).
 * @param direct Whether to not use the forwarded-for header.
 * @return String The header content.
 */
get_http_remote_ip = function (client, direct) {
  var sockjs_id = get_sockjs_id(client);
  if (storage[sockjs_id]) {
    var ip = storage[sockjs_id].remote_ip;

    if (direct) {
      return ip;
    }

    var fwd = storage[sockjs_id].headers['x-forwarded-for'];

    if (fwd) {
      fwd = fwd.split(/\s*,\s*/);
      ip = fwd[0];
    }

    return ip;
  }
};

function get_sockjs_id(client) {
  if (client._session && client._session.socket) {
    var request_url = client._session.socket.url.split('/');

    return request_url.slice(2, 4).join('/');
  }

  return false;
}

// Clean out expired entries from the store.
var last_clean = 0;
function clean() {
  var n = +(new Date),
    keep = [];

  if (last_clean == 0) {
    last_clean = n;
  }

  // only clean once every 5 minutes
  if (n - last_clean < 300000) {
    return;
  }

  _.each(storage, function (v, k) {
    var delta = n - v.time;

    if (delta < 5000) {
      keep.push(k);
    }
  });

  keep.unshift(storage);
  storage = _.pick.apply(_, keep);

  last_clean = n;
}

// Hook us into the matrix.
install_spy();
