// *****************************************************
// global error handling display
// defines errors in a client side collection
//
// files:
// client/helpers/errors.js
// views/includes/errors.html
// views/includes/errors.js
//
// *****************************************************
Template.errors.helpers({
  errors: function() {
    return Errors.find();
  }
});

Template.error.rendered = function() {
  var error = this.data;
  Meteor.defer(function() {
    Errors.update(error._id, {$set: {seen: true}});
  });
};