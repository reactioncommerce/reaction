Template.addressBookAdd.helpers({
  thisAddress: function () {
    let thisAddress = {};
    let account = ReactionCore.Collections.Accounts.findOne();
    if (account) {
      if (account.profile) {
        if (account.profile.name) {
          thisAddress.fullName = account.profile.name;
        }
      }
    }
    if (Session.get("address")) {
      thisAddress.postal = Session.get("address").zipcode;
      thisAddress.country = Session.get("address").countryCode;
      thisAddress.city = Session.get("address").city;
      thisAddress.region = Session.get("address").state;
    }
    return thisAddress;
  },

  hasAddressBookEntries: function () {
    let account = ReactionCore.Collections.Accounts.findOne({
      userId: Meteor.userId()
    });
    if (account) {
      if (account.profile) {
        if (account.profile.addressBook) {
          if (account.profile.addressBook.length > 0) {
            return true;
          }
        }
      }
    }

    return false;
  }
});

Template.addressBookAdd.events({
  // "click #cancel-new, form submit": function(event, template) {
  //   console.log(event, template, Template.instance())
  //   return Session.set("addressBookView", "addressBookGrid");
  // },
  // "submit form": function() {
  //   return Session.set("addressBookView", "addressBookGrid");
  // }
});

/*
 * addressBookAddForm form handling
 * gets accountId and calls addressBookAdd method
 */

AutoForm.hooks({
  addressBookAddForm: {
    onSubmit: function (insertDoc) {
      this.event.preventDefault();
      let accountId;
      let addressBook = $(this.template.firstNode).closest(".address-book");
      let account = ReactionCore.Collections.Accounts.findOne();
      accountId = account._id;

      if (!insertDoc._id) {
        insertDoc._id = Random.id();
      }

      try {
        Meteor.call("accounts/addressBookAdd", insertDoc, accountId);
      } catch (error) {
        this.done(new Error("Failed to add address", error));
        return false;
      }
      this.done();
      addressBook.trigger($.Event("showMainView"));
    }
  }
});
