// *****************************************************
// Define route for reaction-dashboard
// *****************************************************
Router.map(function() {
  this.route('dashboard',{layoutTemplate:'dashboardLayout'});
  this.route('packages',{template: 'pkgManager'});
});
