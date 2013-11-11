// *****************************************************
// general helper for handling of error messages
// inserts views/includes/errors.html
// usage:  throwError("message");  (to display)
//         clearsErrors();         (to clear)
// *****************************************************
Errors = new Meteor.Collection(null);
throwError = function (message) {
  Errors.insert({message: message, seen: false})
}
clearErrors = function () {
  Errors.remove({seen: true});
}
