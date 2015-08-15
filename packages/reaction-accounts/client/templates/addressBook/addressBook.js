/*
 * Template.checkoutAddressBook
 * template determines which view should be used:
 * addAddress (edit or add)
 * addressBookView (view)
 */

Template.addressBook.onCreated(function () {

  var account = ReactionCore.Collections.Accounts.findOne({ userId: Meteor.userId() });

  this.currentViewTemplate = ReactiveVar('addressBookAdd');
  this.templateData = ReactiveVar({});

  if (account.profile) {
    if (account.profile.addressBook) {
      if (account.profile.addressBook.length > 0) {
        this.currentViewTemplate.set('addressBookGrid');

        // TODO: make this more bullet proof
        // Assume that if we're seeing the address book grid
        // then we should have both a default bulling and shipping
        // address selected
        Meteor.call("cart/setStatus", 'checkoutAddressBook');
      }
    }
  }
});


Template.addressBook.onRendered(function () {
  var view = this.$('[blaze-view="addressBook"]').get(0);
});


Template.addressBook.helpers({
  account: function () {
    var account;
    account = ReactionCore.Collections.Accounts.findOne({ userId: Meteor.userId() });
    return account;
  },

  data: function() {
    return Template.instance().templateData.get();
  },

  currentView: function() {
    return Template.instance().currentViewTemplate.get();
  }
});

Template.addressBook.events({

  // **************************************************************************
  //
  //
  'click .action--addNewAddress': function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    Template.instance().currentViewTemplate.set('addressBookAdd');
  },

  // **************************************************************************
  // Edit an address
  //
  'click .action--editAddress': function (event, template) {

    event.preventDefault();
    event.stopPropagation();

    Template.instance().templateData.set({
      address: this
    });

    Template.instance().currentViewTemplate.set('addressBookEdit');

  },

  // **************************************************************************
  // Remove the address from the address book
  //
  'click .action--removeAddress': function (event, template) {

    event.preventDefault();
    event.stopPropagation();

    Meteor.call('addressBookRemove', this, Meteor.userId())
  },


  'click .action--cancelEdit, form submit, showMainView': function (event, template) {
    event.preventDefault();
    event.stopPropagation();


    Template.instance().currentViewTemplate.set('addressBookGrid');



    // var addressBook = template.$('[blaze-view="addressBook"]');
    // addressBook.children().remove();

    // Blaze.render(Template.addressBookGrid, addressBook.get(0))
  }

});
