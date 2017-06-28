import { BrowserPolicy } from "meteor/browser-policy-common";

BrowserPolicy.content.allowEval();
BrowserPolicy.content.allowOriginForAll("http://www.paypal.com");
BrowserPolicy.content.allowOriginForAll("http://www.paypalobjects.com");
BrowserPolicy.content.allowOriginForAll("https://www.sandbox.paypal.com");
BrowserPolicy.content.allowOriginForAll("https://www.paypal.com");
BrowserPolicy.content.allowOriginForAll("https://www.paypalobjects.com");
BrowserPolicy.content.allowOriginForAll("https://tracking.qa.paypal.com");
BrowserPolicy.content.allowOriginForAll("https://akamai.mathtag.com");
