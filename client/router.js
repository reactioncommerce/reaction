// *****************************************************
// iron-router for reaction commerce
// see: https://github.com/EventedMind/iron-router
// iron router handles url path, and renders templates into
// yields based on the logic in this file
// individual reaction packages have their own router.js
// *****************************************************


Router.configure({
  layoutTemplate: 'siteLayout',
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
  'pricing',
  'contactus',
  //Footer
  'about',
  'team',
  'faqs',
  'terms',
  'privacy',
];

Router.map(function () {
  this.route('index', {
    path: '/',
    layoutTemplate: 'siteLayout',
    yieldTemplates: {
      'siteHeader': {to: 'header'},
      'siteFooter': {to: 'footer'}
    }
  });

  for (var i = 0; i < pages.length; i++) {
    this.route(pages[i], {layoutTemplate: 'siteLayout'});
  }

  // 404 Page for reaction
  this.route('notFound', {
    path: '*',
    layoutTemplate: 'siteLayout'
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
