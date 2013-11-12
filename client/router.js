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


// *****************************************************
// generic routes for reaction marketing site layout
// default layout is dashboardLayout template, these
// are all exceptions
// *****************************************************
var pages = [
  //Header
  'howitworks',
  'pricing',
  'contactus',
  //Footer
  'about',
  'faqs',
  'termsofuse',
  'privacypolicy',
];

Router.map(function () {
  this.route('index', {
    path: '/',
    layoutTemplate: 'introLayout',
    before: function () {
      if (!Meteor.loggingIn() && Meteor.user() && (Roles.userIsInRole(Meteor.user(), ['admin', 'owner']))) {
        Router.go('dashboard');
      }
    }
  });

  for (var i = 0; i < pages.length; i++) {
    this.route(pages[i], {layoutTemplate: 'introLayout'});
  }

  // 404 Page for reaction
  this.route('notFound', {
    path: '*',
    layoutTemplate: 'introLayout'
  });


});

Router.before(function () {
  if (!Meteor.userId()) {
    Meteor.loggingIn() ? this.render(this.loadingTemplate) : Router.go('index'); // TODO: there must be a login template render instead of redirect to index route
    this.stop();
  }
}, {
  except: _.union(['login', 'signup', 'forgotPassword', 'index', 'notFound'], pages)
});
