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

/**
 * addressBookAddForm form handling
 * @description gets accountId and calls addressBookAdd method
 * @fires accounts/addressBookAdd method
 */
AutoForm.hooks({
  addressBookAddForm: {
    onSubmit: function (insertDoc) {
      this.event.preventDefault();
      let addressBook = $(this.template.firstNode).closest(".address-book");
      let accountId = ReactionCore.Collections.Accounts.findOne()._id;

      Meteor.call("accounts/addressBookAdd", insertDoc, accountId,
        (error, result) => {
          if (error) {
            Alerts.add("Failed to add address: " + error.message,
              "danger", {
                autoHide: true
              });
            this.done(new Error("Failed to add address: ", error));
            return false;
          }
          if (result) {
            this.done();
            addressBook.trigger($.Event("showMainView"));
          }
        }
      );
    }
  }
});
