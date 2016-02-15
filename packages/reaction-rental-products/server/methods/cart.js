Meteor.methods({
  /**
   * rentalProducts/setRentalPeriod sets or updates the startTime and endTime for a users cart.
   * which determines the cart price for any rental items.
   * @param   {String} cartId    - id of cart we are updating
   * @param   {Date}   startTime - Datetime of start of rental
   * @param   {Date}   endTime   - Datetime of end of rental
   */

  'rentalProducts/setRentalPeriod': function (cartId, startTime, endTime) {
    check(cartId, String);
    check(startTime, Date);
    check(endTime, Date);
    const cart = ReactionCore.Collections.Cart.findOne(cartId);
    // Make sure that cart is owned by current user.
    if (cart.userId !== Meteor.userId() && !ReactionCore.hasPermission('editUserCart')) {
      throw new Meteor.Error('User Id and Cart userId don\'t match');
    }
    const rental = moment(startTime).twix(endTime);

    // If cart has items in it - update the price for those items
    if (cart.items && cart.items.length > 0) {
      // Update price of each item in cart based on rental lengthInDays
      _.map(cart.items, function (item) {
        if (item.type === 'rental') {
          item.variants.price = item.variants.pricePerDay * rental.count('days');
        }
        return item;
      });
    } else {
      cart.items = [];
    }

    Cart.update({
      _id: cartId
    }, {
      $set: {
        startTime: startTime,
        endTime: endTime,
        rentalMonths: rental.count('months'),
        rentalWeeks: rental.count('weeks'),
        rentalDays: rental.count('days'),
        rentalHours: rental.count('hours'),
        rentalMinutes: rental.count('minutes'),
        items: cart.items
      }
    });
  },

  'rentalProducts/setRentalLength': function (cartId, rentalLength, units) {
    check(cartId, String);
    check(rentalLength, Number);
    check(units, Match.OneOf('months', 'weeks', 'days', 'hours', 'minutes'));
    const cart = ReactionCore.Collections.Cart.findOne(cartId);
    if (cart.userId !== Meteor.userId()) {
      return false;
    }

    let opts = {};
    const fieldToSet = 'rental' + units[0].toUpperCase() + units.substr(1); // Make sure that units is correct
    opts[fieldToSet] = rentalLength;

    Cart.update({
      _id: cartId
    }, {
      $set: updateObj
    });
  }
});
