function checkAvailability(reservedDates, requestedDates) {
  for (let date of requestedDates) {
    let min = 0;
    let max = reservedDates.length - 1;

    while (min <= max) {
      let guess = Math.floor((min + max) / 2);

      if (+reservedDates[guess] === +date) {
        return false;
      }
      // Else
      if (+reservedDates[guess] < +date) {
        min = guess + 1;
      } else {
        max = guess - 1;
      }
    }
  }
  return true;
}

Meteor.methods({
  /**
   * rentalProducts/setProductTypeToRental
   * @param   {String} productId - Product Id to update
   * @returns {undefined} - on the client
   */

  'rentalProducts/setProductType': function (productId, productType) {
    check(productId, String);
    check(productType, String);
    // user needs create product permission to change type.
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    const product = ReactionCore.Collections.Products.findOne(productId);
    // if product type is rental, setup variants.
    if (productType === 'rental') {
      let variants = product.variants;
      _.each(variants, function (variant) {
        if (variant.type !== 'inventory') {
          // XXX: This is sketchy and needs to change to a schema validation, but the validation is complicated
          if (!variant.price || variant.price === 0) {
            variant.price = 0.01;
          }
          _.defaults(variant, {pricePerDay: variant.price});
          if (variant.pricePerDay === 0) {
            variant.pricePerDay = variant.price;
          }

          // If this variant is a parent, no inventory children. Only inventory children childmost variants
          if (!_.findWhere(variants, {parentId: variant._id})) {
            let inventoryVariantQty = ReactionCore.Collections.InventoryVariants.find({parentId: variant._id}).count();
            let count = variant.inventoryQuantity - inventoryVariantQty;
            if (count > 0) {
              _(variant.inventoryQuantity - inventoryVariantQty).times(function (n) {
                let inventoryVariant = {};
                inventoryVariant.parentId = variant._id;
                inventoryVariant.barcode = variant.sku + '-' + (n + count); // GetOutfitted.helpers.paddedNumber(n + count);
                inventoryVariant.sku = variant.sku;
                inventoryVariant.color = variant.color;
                inventoryVariant.size = variant.size;

                ReactionCore.Collections.InventoryVariants.insert(inventoryVariant);
              });
            }
          }
        }
      });
      return ReactionCore.Collections.Products.update({_id: productId}, {$set: {type: 'rental', variants: variants}});
    }

    return ReactionCore.Collections.Products.update({_id: productId}, {$set: {type: 'simple'}});
  },

  /*
   * Push an event to a specific inventoryVariant
   * params:
   *   inventoryVariantId - the id of the variant to which we are adding a product event
   *   eventDoc - An object containing the information for the event
   */
  'rentalProducts/createInventoryEvent': function (inventoryVariantId, eventDoc) {
    check(inventoryVariantId, String);

    check(eventDoc, {
      title: String,
      location: Match.Optional({
        address1: Match.Optional(String),
        address2: Match.Optional(String),
        city: Match.Optional(String),
        region: Match.Optional(String),
        postal: Match.Optional(String),
        country: Match.Optional(String),
        coords: Match.Optional({
          x: Number,
          y: Number
        }),
        metafields: Match.Optional(Object)
      }),
      description: Match.Optional(String)
    });

    if (!ReactionCore.hasPermission('createProductEvent')) {
      throw new Meteor.Error(403, 'Access Denied');
    }

    this.unblock();

    _.defaults(eventDoc, {
      _id: Random.id(),
      createdAt: new Date()
    });

    InventoryVariants = ReactionCore.Collections.InventoryVariants;

    const inventoryVariant = InventoryVariants.findOne({
      _id: inventoryVariantId
    });

    if (inventoryVariant) {
      return InventoryVariants.update(
        {_id: inventoryVariantId },
        { $push: { events: eventDoc } }, { validate: false });
    }

    throw new Meteor.Error(400, 'Variant ' + inventoryVariantId + ' not found');
  },

  /*
   * Push an event to a specific variant
   * only need to supply updated information
  #
   * returns array of available (inventory) variant ids
   */
  'rentalProducts/checkInventoryAvailability': function (variantId, reservationRequest, quantity = 1) {
    check(variantId, String);
    check(reservationRequest, {
      startTime: Date,
      endTime: Date
    });
    check(quantity, Number);
    let InventoryVariants = ReactionCore.Collections.InventoryVariants;

    let requestedVariants = [];
    let requestedDates = [];

    // TODO: Add shipping, return, and cleaning buffers into dates to reserve
    // @PaulGreever
    let iter = moment(reservationRequest.startTime).twix(reservationRequest.endTime, {
      allDay: true
    }).iterate('days');

    while (iter.hasNext()) { requestedDates.push(iter.next().toDate()); }

    let inventoryVariants = InventoryVariants.find({parentId: variantId}).fetch();

    if (inventoryVariants.length > 0) {
      // if this variant has multiple inventory
      for (let uid of inventoryVariants) {
        // Check to see if any of the dates requested are unavailable
        // if so, this item is unavailable for requested time period
        if (checkAvailability(uid.unavailableDates, requestedDates)) {
          requestedVariants.push(uid._id);
          if (requestedVariants.length >= quantity) {
            break;
          }
        }
      }
    // TODO: Update single inventory existing on variant for future
    } else if (checkAvailability(variant.unavailableDates, requestedDates)) {
      // else if there is only one of this variant
      requestedVariants.push(variant._id);
    }
    // return requested variants array  (an array consisting of available variantIds)
    return requestedVariants;
  }
});
