const fetch = require("node-fetch");
const uj = require("url-join");

const hydraUrl = "http://localhost:4445"; // process.env.HYDRA_ADMIN_URL;
const mockTlsTermination = {};

if (process.env.MOCK_TLS_TERMINATION) {
  mockTlsTermination = {
    "X-Forwarded-Proto": "https"
  };
}

// A little helper that takes type (can be "login" or "consent") and a challenge and returns the response from ORY Hydra.
function get(flow, challenge) {
  return fetch(uj(hydraUrl, "/oauth2/auth/requests/" + flow + "/" + challenge)).then(function(res) {
    if (res.status < 200 || res.status > 302) {
      // This will handle any errors that aren't network related (network related errors are handled automatically)
      return res.json().then(function(body) {
        console.error("An error occurred while making a HTTP request: ", body);
        return Promise.reject(new Error(body.error.message));
      });
    }

    return res.json();
  });
}

// A little helper that takes type (can be "login" or "consent"), the action (can be "accept" or "reject") and a challenge and returns the response from ORY Hydra.
function put(flow, action, challenge, body) {
  return fetch(
    // Joins process.env.HYDRA_ADMIN_URL with the request path
    uj(hydraUrl, "/oauth2/auth/requests/" + flow + "/" + challenge + "/" + action),
    {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...mockTlsTermination
      }
    }
  ).then(function(res) {
    if (res.status < 200 || res.status > 302) {
      // This will handle any errors that aren't network related (network related errors are handled automatically)
      return res.json().then(function(body) {
        console.error("An error occurred while making a HTTP request: ", body);
        return Promise.reject(new Error(body.error.message));
      });
    }

    return res.json();
  });
}

var hydra = {
  // Fetches information on a login request.
  getLoginRequest: function(challenge) {
    return get("login", challenge);
  },
  // Accepts a login request.
  acceptLoginRequest: function(challenge, body) {
    return put("login", "accept", challenge, body);
  },
  // Rejects a login request.
  rejectLoginRequest: function(challenge) {
    return put("login", "reject", challenge, body);
  },
  // Fetches information on a consent request.
  getConsentRequest: function(challenge) {
    return get("consent", challenge);
  },
  // Accepts a consent request.
  acceptConsentRequest: function(challenge, body) {
    return put("consent", "accept", challenge, body);
  },
  // Rejects a consent request.
  rejectConsentRequest: function(challenge, body) {
    return put("consent", "reject", challenge, body);
  }
};

export default hydra;
