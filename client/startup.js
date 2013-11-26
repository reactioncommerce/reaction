Meteor.startup(function() {
  if (!Meteor.userId() && Meteor.settings.public.isDebug) {
    Meteor.loginWithPassword("admin1@ongoworks.com", "ongo1");
  }
});
