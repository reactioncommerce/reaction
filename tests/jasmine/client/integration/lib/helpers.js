/*
 * helper for checking route state
 * See: https://velocity.readme.io/docs/jasmine-integration-tests-with-iron-router
 * this is far from the perfect solution, it's not every beforeEach, but it is consistent
 *
 * jasmine-jquery helpers included by default
 * See: https://github.com/velesin/jasmine-jquery
 */


(function (Meteor, Tracker, Router) {
  var isRouterReady = false;
  var callbacks = [];

  window.waitForRouter = function (callback) {
    if (isRouterReady) {
      callback();
    } else {
      callbacks.push(callback);
    }
  };

  Router.onAfterAction(function () {
    if (!isRouterReady && this.ready()) {
      Tracker.afterFlush(function () {
        isRouterReady = true;
        callbacks.forEach(function (callback) {
          callback();
        });
        callbacks = []
      })
    }
  });

  Router.onRerun(function () {
    isRouterReady = false;
    this.next();
  });

  Router.onStop(function () {
    isRouterReady = false;
    if (this.next) {
      this.next();
    }
  });
})(Meteor, Tracker, Router);

/*
* waitForElement
* see: https://velocity.readme.io/docs/jasmine-template-testing
*/

waitForElement = function (selector, successCallback) {
  var checkInterval = 50;
  var timeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  var startTime = Date.now();
  var intervalId = Meteor.setInterval(function () {
    if (Date.now() > startTime + timeoutInterval) {
      Meteor.clearInterval(intervalId);
      // Jasmine will handle the test timeout error
    } else if ($(selector).length > 0) {
      Meteor.clearInterval(intervalId);
      successCallback();
    }
  }, checkInterval);
};
