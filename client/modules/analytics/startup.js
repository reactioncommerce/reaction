import { FlowRouter as ReactionRouter } from "meteor/kadira:flow-router-ssr";
import {
  AnalyticsEvents,
  Packages
} from "/lib/collections";
import { Reaction } from "/client/modules/core";

// Create a queue, but don't obliterate an existing one!
analytics = window.analytics = window.analytics || [];

// If the real analytics.js is already on the page return.
if (analytics.initialize) return;

// If the snippet was invoked already show an error.
if (analytics.invoked) {
  if (window.console && console.error) {
    console.error("Segment snippet included twice.");
  }
  return;
}

// Invoked flag, to make sure the snippet
// is never invoked twice.
analytics.invoked = true;

// A list of the methods in Analytics.js to stub.
analytics.methods = [
  "trackSubmit",
  "trackClick",
  "trackLink",
  "trackForm",
  "pageview",
  "identify",
  "reset",
  "group",
  "track",
  "ready",
  "alias",
  "page",
  "once",
  "off",
  "on"
];

// Define a factory to create stubs. These are placeholders
// for methods in Analytics.js so that you never have to wait
// for it to load to actually record data. The `method` is
// stored as the first argument, so we can replay the data.
analytics.factory = function (method) {
  return function () {
    let args = Array.prototype.slice.call(arguments);
    args.unshift(method);
    analytics.push(args);
    return analytics;
  };
};

// For each of our methods, generate a queueing stub.
for (let i = 0; i < analytics.methods.length; i++) {
  const key = analytics.methods[i];
  analytics[key] = analytics.factory(key);
}

// Define a method to load Analytics.js from our CDN,
// and that will be sure to only ever load it once.
analytics.load = function (key) {
  // Create an async script element based on your key.
  let script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = (document.location.protocol === "https:" ? "https://" : "http://") +
    "cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
  // Insert our script next to the first script element.
  let first = document.getElementsByTagName("script")[0];
  first.parentNode.insertBefore(script, first);
};

// Add a version to keep track of what"s in the wild.
analytics.SNIPPET_VERSION = "3.1.0";

// Load Analytics.js with your key, which will automatically
// load the tools you"ve enabled for your account. Boosh!
// analytics.load("YOUR_WRITE_KEY");

// Make the first page call to load the integrations. If
// you"d like to manually name or tag the page, edit or
// move this call however you"d like.
// analytics.page();


//
// Initialize analytics page tracking
//

// segment tracking
function notifySegment(context) {
  analytics.page({
    userId: Meteor.userId(),
    properties: {
      url: context.path,
      shopId: Reaction.getShopId()
    }
  });
}

// function notifyGoogleAnalytics(context) {
//   // ga("send", "pageview", context.path);
// }
//
// function notifyMixpanel(context) {
//   // ga("send", "pageview", context.path);
// }

FlowRouter.triggers.enter([notifySegment]);

//
// Initialize analytics event tracking
//
Meteor.startup(function () {
  Tracker.autorun(function () {
    const coreAnalytics = Packages.findOne({
      name: "reaction-analytics"
    });

    // check if installed and enabled
    if (!coreAnalytics || !coreAnalytics.enabled) {
      return Alerts.removeType("analytics-not-configured");
    }

    const googleAnalytics = coreAnalytics.settings.public.googleAnalytics;
    const mixpanel = coreAnalytics.settings.public.mixpanel;
    const segmentio = coreAnalytics.settings.public.segmentio;
    const settingsURL = ReactionRouter.pathFor("dashboard");
    //
    // segment.io
    //
    if (segmentio.enabled) {
      if (segmentio.api_key) {
        analytics.load(coreAnalytics.settings.public.segmentio.api_key);
        return {};
      } else if (!segmentio.api_key && Roles.userIsInRole(Meteor.user(), "admin")) {
        _.defer(function () {
          return Alerts.toast(
            `Segment Write Key is not configured. <a href="${settingsURL}">Configure now</a>.`,
            "danger", {
              html: true,
              sticky: true
            });
        });
      }
    }

    //
    // Google Analytics
    //
    if (googleAnalytics.enabled) {
      if (googleAnalytics.api_key) {
        ga("create", coreAnalytics.settings.public.google - analytics.api_key, "auto");
      } else if (!googleAnalytics.api_key && Roles.userIsInRole(Meteor.user(), "admin")) {
        _.defer(function () {
          return Alerts.toast(
            `Google Analytics Property is not configured. <a href="${settingsURL}">Configure now</a>.`,
            "errorr", {
              type: "analytics-not-configured",
              html: true,
              sticky: true
            });
        });
      }
    }

    //
    // mixpanel
    //
    if (mixpanel.enabled) {
      if (mixpanel.api_key) {
        mixpanel.init(coreAnalytics.settings.public.mixpanel.api_key);
      } else if (!mixpanel.api_key && Roles.userIsInRole(Meteor.user(), "admin")) {
        _.defer(function () {
          return Alerts.toast(
            `Mixpanel Token is not configured. <a href="${settingsURL}">Configure now</a>.`,
            "error", {
              type: "analytics-not-configured",
              html: true,
              sticky: true
            });
        });
      }
    }

    if (!Roles.userIsInRole(Meteor.user(), "admin")) {
      return Alerts.removeType("analytics-not-configured");
    }
  });

  //
  // analytics event processing
  //
  return $(document.body).click(function (e) {
    let $targets = $(e.target).closest("*[data-event-action]");
    $targets = $targets.parents("*[data-event-action]").add($targets);
    return $targets.each(function (index, element) {
      let $element = $(element);
      const analyticsEvent = {
        eventType: "event",
        category: $element.data("event-category"),
        action: $element.data("event-action"),
        label: $element.data("event-label"),
        value: $element.data("event-value")
      };
      if (typeof ga === "function") {
        ga("send", "event", analyticsEvent.category, analyticsEvent.action, analyticsEvent.label,
          analyticsEvent.value);
      }
      if (typeof mixpanel === "object" && mixpanel.length > 0) {
        mixpanel.track(analyticsEvent.action, {
          Category: analyticsEvent.category,
          Label: analyticsEvent.label,
          Value: analyticsEvent.value
        });
      }

      if (typeof analytics === "object") {
        analytics.track(analyticsEvent.action, {
          Category: analyticsEvent.category,
          Label: analyticsEvent.label,
          Value: analyticsEvent.value
        });
      }
      // we could add a hook here, but not needed as
      // you can trigger using the collection hooks
      return AnalyticsEvents.insert(analyticsEvent);
    });
  });
});
