Template.addressBookAdd.helpers({
  thisAddress: function() {
    var account, ref, thisAddress;
    account = ReactionCore.Collections.Accounts.findOne();
    thisAddress = {
      'fullName': account != null ? (ref = account.profile) != null ? ref.name : void 0 : void 0
    };
    if (Session.get("address")) {
      thisAddress.postal = Session.get("address").zipcode;
      thisAddress.country = Session.get("address").countryCode;
      thisAddress.city = Session.get("address").city;
      thisAddress.region = Session.get("address").state;
    }
    return thisAddress;
  },

  hasAddressBookEntries: function() {
    var account = ReactionCore.Collections.Accounts.findOne({ userId: Meteor.userId() });

    if (account.profile) {
      if (account.profile.addressBook) {
        if (account.profile.addressBook.length > 0) {
          return true;
        }
      }
    }

    return false;
  }
});

Template.addressBookAdd.events({
  // 'click #cancel-new, form submit': function(event, template) {
  //   console.log(event, template, Template.instance())
  //   return Session.set("addressBookView", "addressBookGrid");
  // },
  // 'submit form': function() {
  //   return Session.set("addressBookView", "addressBookGrid");
  // }
});


/*
 * addressBookAddForm form handling
 * gets accountId and calls addressBookAdd method
 */

AutoForm.hooks({
  addressBookAddForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {

      this.event.preventDefault();

      var accountId, error;
      var addressBook = $(this.template.firstNode).closest('.address-book');

      accountId = ReactionCore.Collections.Accounts.findOne({
        userId: Meteor.userId()
      })._id;

      if (!insertDoc._id) {
        insertDoc._id = Random.id();
      }

      try {
        Meteor.call("addressBookAdd", insertDoc, accountId);
      } catch (_error) {
        error = _error;
        this.done(new Error('Failed to add address', error));
        return false;
      }


      this.done();

      // Show the grid
      addressBook.trigger($.Event('showMainView'))

      // Set the cart status
      Meteor.call("cart/setStatus", 'checkoutAddressBook');

    }
  }
});
