Meteor.startup(function () {
  BrowserPolicy.content.allowEval();
  BrowserPolicy.content.allowOriginForAll('*.mapbox.com/');
});
