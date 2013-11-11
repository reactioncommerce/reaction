// *****************************************************
// iron-router for reaction commerce
// see: https://github.com/EventedMind/iron-router
// iron router handles url path, and renders templates into
// yields based on the logic in this file
// individual reaction packages have their own router.js
// *****************************************************


Router.configure({
  layoutTemplate: 'dashboardLayout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});


Router.map(function () {
  this.route('index', {
    path: '/',
    layoutTemplate: 'introLayout',
    before: function () {
      if (!Meteor.loggingIn() && Meteor.user() && Meteor.user().profile.store) {
        Router.go('dashboard');
      }
    }
  });

  // *****************************************************
  // generic routes for reaction marketing site layout
  // default layout is dashboardLayout template, these
  // are all exceptions
  // *****************************************************
  //Header
  this.route('howitworks', {layoutTemplate: 'introLayout'});
  this.route('pricing', {layoutTemplate: 'introLayout'});
  this.route('contactus', {layoutTemplate: 'introLayout'});
  //Footer
  this.route('about', {layoutTemplate: 'introLayout'});
  this.route('faqs', {layoutTemplate: 'introLayout'});
  this.route('termsofuse', {layoutTemplate: 'introLayout'});
  this.route('privacypolicy', {layoutTemplate: 'introLayout'});

  // 404 Page for reaction
  this.route('notFound', {
    path: '*',
    layoutTemplate: 'introLayout'
  });


});
