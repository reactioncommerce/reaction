Meteor.startup(function() {
  if (!Meteor.userId() && Meteor.settings.public.isDebug) {
    Meteor.loginWithPassword("aaron@ongoworks.com", "ongo1");
  }
});
