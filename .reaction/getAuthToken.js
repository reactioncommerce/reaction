const { URL } = require("url");
const fetch = require("node-fetch");
const simpleOAuth2 = require("simple-oauth2");

const HYDRA_OAUTH_URL = "http://localhost:4444";
const HYDRA_ADMIN_URL = "http://localhost:4445";
const OAUTH2_CLIENT_ID = "get-token-dev-script";
const OAUTH2_CLIENT_SECRET = "get-token-dev-script-secret";
const FAKE_REDIRECT_URI = "http://localhost:1234/redirect";

// Initialize the OAuth2 Library
const oauth2 = simpleOAuth2.create({
  client: {
    id: OAUTH2_CLIENT_ID,
    secret: OAUTH2_CLIENT_SECRET
  },
  auth: {
    authorizePath: "/oauth2/auth",
    tokenHost: HYDRA_OAUTH_URL,
    tokenPath: "/oauth2/token"
  }
});

const makeAbsolute = (relativeUrl, baseUrl) => {
  const url = new URL(relativeUrl, baseUrl);
  return url.href;
};

/* eslint-disable camelcase */
const hydraClient = {
  client_id: OAUTH2_CLIENT_ID,
  client_secret: OAUTH2_CLIENT_SECRET,
  grant_types: ["authorization_code"],
  redirect_uris: [FAKE_REDIRECT_URI],
  response_types: ["code"],
  scope: "offline openid",
  subject_type: "public",
  token_endpoint_auth_method: "client_secret_basic"
};
/* eslint-enable camelcase */

/**
 * @summary Calls Hydra's endpoint to create an OAuth client for this application
 *   if one does not already exist. This works because the Hydra admin port
 *   is exposed on the internal network. Ensure that it is not exposed to the
 *   public Internet in production.
 * @returns {Promise<undefined>} Nothing
 */
async function ensureHydraClient() {
  const getClientResponse = await fetch(makeAbsolute(`/clients/${OAUTH2_CLIENT_ID}`, HYDRA_ADMIN_URL), {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (![200, 404].includes(getClientResponse.status)) {
    console.error(await getClientResponse.text());
    throw new Error(`Could not get Hydra client [${getClientResponse.status}]`);
  }

  if (getClientResponse.status === 200) {
    // Update the client to be sure it has the latest config
    const updateClientResponse = await fetch(makeAbsolute(`clients/${OAUTH2_CLIENT_ID}`, HYDRA_ADMIN_URL), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hydraClient)
    });

    if (updateClientResponse.status !== 200) {
      console.error(await updateClientResponse.text());
      throw new Error(`Could not update Hydra client [${updateClientResponse.status}]`);
    }
  } else {
    const response = await fetch(makeAbsolute("/clients", HYDRA_ADMIN_URL), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hydraClient)
    });

    switch (response.status) {
      case 200:
      // intentional fallthrough!
      // eslint-disable-line no-fallthrough
      case 201:
      // intentional fallthrough!
      // eslint-disable-line no-fallthrough
      case 409:
        break;
      default:
        console.error(await response.text());
        throw new Error(`Could not create Hydra client [${response.status}]`);
    }
  }
}

async function main(userId) {
  await ensureHydraClient();

  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: FAKE_REDIRECT_URI,
    scope: "openid",
    state: "12345678"
  });

  const startLoginResult = await fetch(authorizationUri, {
    redirect: "manual"
  });
  const redirect1 = startLoginResult.headers.get("location");
  const redirect1Parsed = new URL(redirect1);

  if (redirect1.includes("oauth-error")) {
    console.error(redirect1Parsed.searchParams.get("error_hint"));
    return;
  }

  const challenge = redirect1Parsed.searchParams.get("login_challenge");
  const cookie = startLoginResult.headers.get("set-cookie");

  const acceptLoginResult = await fetch(`${HYDRA_ADMIN_URL}/oauth2/auth/requests/login/accept?login_challenge=${challenge}`, {
    method: "PUT",
    body: JSON.stringify({
      subject: userId,
      remember: false
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const { redirect_to: redirect2 } = await acceptLoginResult.json();

  const continueLoginResult = await fetch(redirect2, {
    headers: {
      "Cookie": cookie
    },
    redirect: "manual"
  });
  const redirect3 = continueLoginResult.headers.get("location");
  const redirect3Parsed = new URL(redirect3);

  if (redirect3.includes("error_debug")) {
    console.error(redirect3Parsed.searchParams.get("error_debug"));
    return;
  }

  const consentChallenge = redirect3Parsed.searchParams.get("consent_challenge");
  const nextCookies = continueLoginResult.headers.raw()['set-cookie']

  const consentResult = await fetch(`${HYDRA_ADMIN_URL}/oauth2/auth/requests/consent/accept?consent_challenge=${consentChallenge}`, {
    method: "PUT",
    body: JSON.stringify({
      grant_scope: ["openid"],
      remember: false
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const { redirect_to: redirect4 } = await consentResult.json();

  const postConsentResult = await fetch(redirect4, {
    headers: nextCookies.map((val) => (["Cookie", val])),
    redirect: "manual"
  });
  const redirect5 = postConsentResult.headers.get("location");
  const redirect5Parsed = new URL(redirect5);

  if (redirect5.includes("error_debug")) {
    console.error(redirect5Parsed.searchParams.get("error_debug"));
    return;
  }

  const code = redirect5Parsed.searchParams.get("code");

  const { access_token: accessToken } = await oauth2.authorizationCode.getToken({
    code,
    redirect_uri: FAKE_REDIRECT_URI,
    scope: "openid"
  });

  console.log(`\nAccess token for user ${userId}:\n\n${accessToken}\n`);
  console.log(`Paste this in GraphQL Playground "HTTP HEADERS" box:\n{\n    "Authorization": "${accessToken}"\n}\n`);

  // server.close();
}

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: node getAuthToken.js [userId]");
  process.exit(1);
}

main(userId).catch((error) => {
  console.error(error.message);
  console.error("\nMake sure the Hydra service is running with ports 4444 and 4445 accessible from the host computer\n");
});
