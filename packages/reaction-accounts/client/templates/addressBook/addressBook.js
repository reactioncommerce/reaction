/*
 * Template.checkoutAddressBook
 * template determines which view should be used:
 * addAddress (edit or add)
 * addressBookView (view)
 */


Template.addressBook.onRendered(function () {
  var view = this.$('[blaze-view="addressBook"]').get(0);
  Blaze.render(Template.addressBookGrid, view);
});


Template.addressBook.helpers({
  account: function () {
    var account;
    account = ReactionCore.Collections.Accounts.findOne({ userId: Meteor.userId() });
    return account;
  },
});

Template.addressBook.events({

  // **************************************************************************
  // Edit an address
  //
  'click .action--editAddress': function (event, template) {

    event.preventDefault();
    event.stopPropagation();

    var addressBook = template.$('[blaze-view="addressBook"]');
    addressBook.children().remove();

    Blaze.renderWithData(Template.addressBookEdit, {
      address: this
    }, addressBook.get(0))

  },

  // **************************************************************************
  // Remove the address from the address book
  //
  'click .action--removeAddress': function (event, template) {

    event.preventDefault();
    event.stopPropagation();

    Meteor.call('addressBookRemove', this, Meteor.userId())
  },


  // **************************************************************************
  //
  //
  'click .action--addNewAddress': function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    var addressBook = template.$('[blaze-view="addressBook"]');
    addressBook.children().remove();

    Blaze.render(Template.addressBookAdd, addressBook.get(0))
  },

  'click .action--cancelEdit, form submit': function (event, template) {
    event.preventDefault();
    event.stopPropagation();

    var addressBook = template.$('[blaze-view="addressBook"]');
    addressBook.children().remove();

    Blaze.render(Template.addressBookGrid, addressBook.get(0))
  }

});
