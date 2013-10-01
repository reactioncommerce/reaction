// *****  Subscriptions *******
//Meteor.subscribe('domains');
projectHandle = Meteor.subscribeWithPagination('projects', 10);

Meteor.subscribe('captures');
Meteor.subscribe('countstats');


//Counts = new Meteor.Collection('counts');
Deps.autorun(function () {
  Meteor.subscribe("captures-by-project", Session.get("currentProjectId"));
  Meteor.subscribe('countstats',Session.get("statsProjectId"));
});

