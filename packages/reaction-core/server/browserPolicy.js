
/*
 * set browser policies
 */


if (process.env.NODE_ENV === 'development') {
  BrowserPolicy.content.allowOriginForAll('localhost:*');
  BrowserPolicy.content.allowConnectOrigin('ws://localhost:5000');
  BrowserPolicy.content.allowConnectOrigin('ws://localhost:63580');
  BrowserPolicy.content.allowConnectOrigin('http://localhost:5000');
  BrowserPolicy.content.allowConnectOrigin('http://localhost:63580');
  BrowserPolicy.framing.allowAll();
}

BrowserPolicy.content.allowFontDataUrl();

BrowserPolicy.content.allowOriginForAll("fonts.googleapis.com");

BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com");

BrowserPolicy.content.allowOriginForAll("fonts.gstatic.com");

BrowserPolicy.content.allowImageOrigin("graph.facebook.com");

BrowserPolicy.content.allowImageOrigin("fbcdn-profile-a.akamaihd.net");

BrowserPolicy.content.allowImageOrigin("secure.gravatar.com");

BrowserPolicy.content.allowImageOrigin("i0.wp.com");
