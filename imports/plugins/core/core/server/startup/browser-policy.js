import url from "url";
import { Meteor } from "meteor/meteor";
import { BrowserPolicy } from "meteor/browser-policy-common";
import { WebApp } from "meteor/webapp";

/**
 * Set headers for Reaction CDN
 */
WebApp.rawConnectHandlers.use((req, res, next) => {
  if (req._parsedUrl.pathname.match(/\.(ttf|ttc|otf|eot|woff|svg|font\.css|css)$/)) {
    res.setHeader("Access-Control-Allow-Origin", "assets.reactioncommerce.com");
  }
  next();
});

/**
 * Set browser policies
 */
if (process.env.NODE_ENV === "development") {
  BrowserPolicy.content.allowOriginForAll("localhost:*");
  BrowserPolicy.content.allowConnectOrigin("ws://localhost:*");
  BrowserPolicy.content.allowConnectOrigin("http://localhost:*");
  BrowserPolicy.content.allowConnectOrigin("https://localhost:*");
  BrowserPolicy.framing.allowAll();

  // GraphiQL
  BrowserPolicy.content.allowOriginForAll("unpkg.com");
  BrowserPolicy.content.allowOriginForAll("cdn.jsdelivr.net");
}

// get current hostname of app
const { hostname } = url.parse(Meteor.absoluteUrl());

// allow websockets (Safari fails without this)
BrowserPolicy.content.allowConnectOrigin(`ws://${hostname}`);
BrowserPolicy.content.allowConnectOrigin(`wss://${hostname}`);

BrowserPolicy.content.allowOriginForAll("*.facebook.com");
BrowserPolicy.content.allowOriginForAll("*.fbcdn.net");
BrowserPolicy.content.allowOriginForAll("connect.facebook.net");
BrowserPolicy.content.allowOriginForAll("*.googleusercontent.com");
BrowserPolicy.content.allowOriginForAll("*.cdninstagram.com");

BrowserPolicy.content.allowImageOrigin("fbcdn-profile-a.akamaihd.net");
BrowserPolicy.content.allowImageOrigin("secure.gravatar.com");
BrowserPolicy.content.allowImageOrigin("i0.wp.com");

BrowserPolicy.content.allowFontDataUrl();
BrowserPolicy.content.allowOriginForAll("assets.reactioncommerce.com");
BrowserPolicy.content.allowOriginForAll("cdnjs.cloudflare.com");
BrowserPolicy.content.allowOriginForAll("fonts.googleapis.com");
BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com");
BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com");

BrowserPolicy.content.allowOriginForAll("enginex.kadira.io");
BrowserPolicy.content.allowOriginForAll("*.stripe.com");
