import { FlowRouter as ReactionRouter } from "meteor/kadira:flow-router-ssr";
import {
  AnalyticsEvents,
  Packages
} from "/lib/collections";

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
      if (typeof analytics === "object" && analytics.length > 0) {
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
