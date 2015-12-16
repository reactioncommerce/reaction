Template.addressBookForm.helpers({

  /*
   * TODO: update for i18n
   */
  countryOptions: function() {
    var country, locale, options, ref, shop;
    options = [];
    shop = ReactionCore.Collections.Shops.findOne();
    ref = shop != null ? shop.locales.countries : void 0;
    for (country in ref) {
      locale = ref[country];
      options.push({
        'label': locale.name,
        'value': country
      });
    }
    return options;
  },
  statesForCountry: function() {
    var locale, options, ref, selectedCountry, shop, state;
    shop = ReactionCore.Collections.Shops.findOne();
    selectedCountry = Session.get('addressBookCountry' || AutoForm.getFieldValue('country'));
    if (!selectedCountry) {
      return false;
    }
    if ((shop != null ? shop.locales.countries[selectedCountry].states : void 0) == null) {
      return false;
    }
    options = [];
    ref = shop != null ? shop.locales.countries[selectedCountry].states : void 0;
    for (state in ref) {
      locale = ref[state];
      options.push({
        'label': locale.name,
        'value': state
      });
    }
    return options;
  },

  /*
   *  Defaults billing/shipping when 1st new address.
   */
  isBillingDefault: function () {
    return typeof this.address === "object" ? this.address.isBillingDefault : true;
  },
  isShippingDefault: function () {
    return typeof this.address === "object" ? this.address.isShippingDefault : true;
  }
});

Template.addressBookForm.events({
  'change [name="country"]': function() {
    return Session.set('addressBookCountry', AutoForm.getFieldValue('country'));
  }
});
