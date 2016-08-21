import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { AnalyticsEvents, Packages } from "/lib/collections";
import { Reaction, i18next, Logger } from "/client/api";

// Create a queue, but don't obliterate an existing one!
analytics = window.analytics = window.analytics || [];

// If the real analytics.js is already on the page return.
if (analytics.initialize) return;

// If the snippet was invoked already show an error.
if (analytics.invoked) {
  Logger.warn("Segment snippet included twice.");
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
    const args = Array.prototype.slice.call(arguments);
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
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = (document.location.protocol === "https:" ? "https://" : "http://") +
    "cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
  // Insert our script next to the first script element.
  const first = document.getElementsByTagName("script")[0];
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

// segment page tracking
function notifySegment(context) {
  if (typeof analytics !== "undefined") {
    analytics.page({
      userId: Meteor.userId(),
      properties: {
        url: context.path,
        shopId: Reaction.getShopId()
      }
    });
  }
}
// google analytics page tracking
function notifyGoogleAnalytics(context) {
  if (typeof ga !== "undefined") {
    ga("send", "pageview", context.path);
  }
}

// mixpanel page tracking
function notifyMixpanel(context) {
  if (typeof mixpanel !== "undefined") {
    mixpanel.track("page viewed", {
      "page name": document.title,
      "url": context.path
    });
  }
}

Reaction.Router.triggers.enter([notifySegment, notifyGoogleAnalytics, notifyMixpanel]);

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

    //
    // segment.io
    //
    if (segmentio.enabled) {
      if (segmentio.api_key && analytics.invoked === true) {
        analytics.load(segmentio.api_key);
      } else if (!segmentio.api_key && Reaction.hasAdminAccess()) {
        _.defer(function () {
          return Alerts.toast(
            `${i18next.t("admin.settings.segmentNotConfigured")}`,
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
        ga("create", googleAnalytics.api_key, "auto");
      } else if (!googleAnalytics.api_key && Reaction.hasAdminAccess()) {
        _.defer(function () {
          return Alerts.toast(
            `${i18next.t("admin.settings.googleAnalyticsNotConfigured")}`,
            "error", {
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
        mixpanel.init(mixpanel.api_key);
      } else if (!mixpanel.api_key && Reaction.hasAdminAccess()) {
        _.defer(function () {
          return Alerts.toast(
            `${i18next.t("admin.settings.mixpanelNotConfigured")}`,
            "error", {
              type: "analytics-not-configured",
              html: true,
              sticky: true
            });
        });
      }
    }

    if (!Reaction.hasAdminAccess()) {
      return Alerts.removeType("analytics-not-configured");
    }
    return null;
  });

  //
  // analytics event processing
  //
  return $(document.body).click(function (e) {
    let $targets = $(e.target).closest("*[data-event-action]");
    $targets = $targets.parents("*[data-event-action]").add($targets);
    return $targets.each(function (index, element) {
      const $element = $(element);
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
