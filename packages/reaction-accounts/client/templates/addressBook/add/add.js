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
  }
});

Template.addressBookAdd.events({
  'click #cancel-new, form submit': function(event, template) {
    console.log(event, template, Template.instance())
    return Session.set("addressBookView", "addressBookGrid");
  },
  'submit form': function() {
    return Session.set("addressBookView", "addressBookGrid");
  }
});


/*
 * addressBookAddForm form handling
 * gets accountId and calls addressBookAdd method
 */

AutoForm.hooks({
  addressBookAddForm: {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {

      var accountId, error;

      this.event.preventDefault();

      console.log('YSYSYSYSYSY!!!!', this.template)

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
      Session.set("addressBookView", "addressBookGrid");
      addressBookEditId.set();
    }
  }
});
