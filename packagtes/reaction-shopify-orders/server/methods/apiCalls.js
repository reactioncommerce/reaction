function keyify(string) {
  let keyifiedString = string.replace(/([\W\/])/ig, '');
  keyifiedString = keyifiedString[0].toLowerCase() + keyifiedString.substr(1);
  return keyifiedString;
}

function stripTags(string) {
  return string.replace(/<[^>]+>/g, '');
}


function normalizeSize(size) {
  if (size.toUpperCase() === 'XS') {
    return 'Extra Small';
  } else if (size.toUpperCase() === 'XL') {
    return 'Extra Large';
  } else if (size === 'Large/Extra Large') {
    return 'Large';
  }
  return stripTags(size);
}

function formatDateForApi(date) {
  let shopifyOrders = ReactionCore.Collections.Packages.findOne({name: 'reaction-shopify-orders'}).settings.public;

  if (shopifyOrders.lastUpdated) {
    // return moment(date).format('YYYY-MM-DD HH:mm'); // current orders
    // return moment(date).format('2016-1-5') + ' 00:00';
    // return moment(date).format('YYYY-MM-DD') + ' 00:00'; // Todays Orders
    return moment(date).format('2003-11-12') + ' 00:00';
  }
  return moment(new Date('2003-09-20')).format('YYYY-MM-DD');
}

function shipmentDateChecker(date, isLocalDelivery, transitTime) {
  if (isLocalDelivery) {
    return date;
  }

  let numberOfWeekendDays = 0;
  const shipDate = moment(date);
  const arrivalDate = moment(shipDate).add(transitTime - 1, 'days');
  let additionalDays = 0;
  let daysToAdd = 0;

  if (moment(arrivalDate).isoWeekday() === 7) {
    shipDate.subtract(2, 'days');
    additionalDays += 2;
    arrivalDate.subtract(2, 'days');
  } else if (moment(arrivalDate).isoWeekday() === 6) {
    shipDate.subtract(1, 'days');
    additionalDays += 1;
    arrivalDate.subtract(1, 'days');
  }

  if (moment(shipDate).isoWeekday() === 7) {
    shipDate.subtract(2, 'days');
    additionalDays += 2;
  } else if (moment(shipDate).isoWeekday() === 6) {
    shipDate.subtract(1, 'days');
    additionalDays += 1;
  }

  const shipmentRange = shipDate.twix(arrivalDate, {allDay: true});
  let iter = shipmentRange.iterate('days');
  //
  while (iter.hasNext()) {
    let isoWeekday = iter.next().isoWeekday();
    if (isoWeekday === 7 || isoWeekday === 6) {
      numberOfWeekendDays += 1;
    }
  }

  daysToAdd = numberOfWeekendDays - additionalDays;
  if (daysToAdd <= 0) {
    daysToAdd = 0;
  }

  return shipDate.subtract(daysToAdd, 'days').toDate();
  // return moment(date).subtract(numberOfWeekendDays, 'days').toDate();
}

function arrivalDateChecker(date, isLocalDelivery) {
  if (isLocalDelivery) {
    return date;
  }
  if (moment(date).isoWeekday() === 7) {
    return moment(date).subtract(2, 'days').toDate();
  } else if (moment(date).isoWeekday() === 6) {
    return moment(date).subtract(1, 'days').toDate();
  }
  return date;
}

function shipmentChecker(date, isLocalDelivery) {
  if (isLocalDelivery) {
    return date;
  }
  if (moment(date).isoWeekday() === 7) {
    return moment(date).subtract(2, 'days').toDate();
  } else if (moment(date).isoWeekday() === 6) {
    return moment(date).subtract(1, 'days').toDate();
  }
  return date;
}

function returnChecker(date, isLocalDelivery) {
  if (isLocalDelivery) {
    return date;
  }
  if (moment(date).isoWeekday() === 7) {
    return moment(date).add(1, 'days').toDate();
  }
  return date;
}

function rushShipmentChecker(date) {
  if (moment(date).isoWeekday() === 7) {
    return moment(date).add(1, 'days').toDate();
  } else if (moment(date).isoWeekday() === 6) {
    return moment(date).add(2, 'days').toDate();
  }
  return date;
}

function getFedexTransitTime(address) {
  const shopifyOrders = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-shopify-orders'
  });
  if (!shopifyOrders.settings.fedex) {
    ReactionCore.Log.warn('Fedex API not setup. Transit Days will not be estimated');
    return false;
  }
  fedexTimeTable = {
    'ONE_DAY': 1,
    'TWO_DAYS': 2,
    'THREE_DAYS': 3,
    'FOUR_DAYS': 4,
    'FIVE_DAYS': 5,
    'SIX_DAYS': 6,
    'SEVEN_DAYS': 7,
    'EIGHT_DAYS': 8,
    'NINE_DAYS': 9,
    'TEN_DAYS': 10,
    'ELEVEN_DAYS': 11,
    'TWELVE_DAYS': 12,
    'THIRTEEN_DAYS': 13,
    'FOURTEEN_DAYS': 14,
    'FIFTEEN_DAYS': 15,
    'SIXTEEN_DAYS': 16,
    'SEVENTEEN_DAYS': 17,
    'EIGHTEEN_DAYS': 18,
    'NINETEEN_DAYS': 19,
    'TWENTY_DAYS': 20
  };

  let fedex = new Fedex({
    'environment': shopifyOrders.settings.fedex.liveApi ? 'live' : 'sandbox',
    'key': shopifyOrders.settings.fedex.key,
    'password': shopifyOrders.settings.fedex.password,
    'account_number': shopifyOrders.settings.fedex.accountNumber,
    'meter_number': shopifyOrders.settings.fedex.meterNumber,
    'imperial': true
  });

  let shipment = {
    ReturnTransitAndCommit: true,
    CarrierCodes: ['FDXE', 'FDXG'],
    RequestedShipment: {
      DropoffType: 'REGULAR_PICKUP',
      ServiceType: 'FEDEX_GROUND', // GROUND_HOME_DELIVERY
      PackagingType: 'YOUR_PACKAGING',
      Shipper: {
        Contact: {
          PersonName: 'Shipper Person',
          CompanyName: 'GetOutfitted',
          PhoneNumber: '5555555555'
        },
        Address: {
          StreetLines: [
            '103 Main St'
          ],
          City: 'Dillon',
          StateOrProvinceCode: 'CO',
          PostalCode: '80435',
          CountryCode: 'US'
        }
      },
      Recipient: {
        Contact: {
          PersonName: 'Receiver Person',
          CompanyName: 'Hotel',
          PhoneNumber: '5555555555'
        },
        Address: {
          StreetLines: [
            address.address1,
            address.address2
          ],
          City: address.city,
          StateOrProvinceCode: address.province_code,
          PostalCode: address.zip,
          CountryCode: address.country_code,
          Residential: false // Or true
        }
      },
      ShippingChargesPayment: {
        PaymentType: 'SENDER',
        Payor: {
          ResponsibleParty: {
            AccountNumber: fedex.options.account_number
          }
        }
      },
      PackageCount: '1',
      RequestedPackageLineItems: {
        SequenceNumber: 1,
        GroupPackageCount: 1,
        Weight: {
          Units: 'LB',
          Value: '7.0'
        },
        Dimensions: {
          Length: 24,
          Width: 14,
          Height: 6,
          Units: 'IN'
        }
      }
    }
  };

  let fedexRatesSync = Meteor.wrapAsync(fedex.rates);

  let rates = fedexRatesSync(shipment);
  if (!rates.RateReplyDetails) {
    return false;
  }
  let groundRate = rates.RateReplyDetails[0];
  return fedexTimeTable[groundRate.TransitTime];
}

function generateShippingAddress(order) {
  if (!order.shipping_address) {
    order.shipping_address = order.billing_address;
  }
  return [ {address: {
    country: order.shipping_address.country_code,
    fullName: order.shipping_address.name,
    address1: order.shipping_address.address1,
    address2: order.shipping_address.address2,
    region: order.shipping_address.province_code,
    postal: order.shipping_address.zip,
    city: order.shipping_address.city,
    phone: order.shipping_address.phone
  }}];
}

function generateBillingAddress(order) {
  if (!order.billing_address) {
    order.billing_address = order.shipping_address;
  }
  return [{address: {
    country: order.billing_address.country_code,
    fullName: order.billing_address.name,
    address1: order.billing_address.address1,
    address2: order.billing_address.address2,
    region: order.billing_address.province_code,
    postal: order.billing_address.zip,
    city: order.billing_address.city,
    phone: order.billing_address.phone
  }}];
}

// TODO: Figure out why QTY is always equal to one.
function createOrderItem(productId, variantObj, qty = 1, customerName) {
  return {
    _id: Random.id(),
    shopId: ReactionCore.getShopId(),
    productId: productId,
    quantity: qty,
    variants: variantObj,
    customerName: customerName,
    workflow: {
      status: 'orderCreated',
      workflow: ['inventoryAdjusted']
    }
  };
}

function setupRentalFromOrderNotes(notes) {
  let rental = {};
  let d = new Date();
  let timezoneOffset = d.getTimezoneOffset() / 60;
  // startDateObj and endDateObj return an object such as {name: 'first_ski_day', value: '2015-12-30' }
  let startDateObj = _.find(notes, function (note) {
    return ['first_ski_day', 'first_camping_day', 'first_activity_day'].indexOf(note.name) > -1;
  });

  let endDateObj = _.find(notes, function (note) {
    return ['last_ski_day', 'last_camping_day', 'last_activity_day'].indexOf(note.name) > -1;
  });

  if (startDateObj && endDateObj) {
    // If we have both a start and end date, create js Date objects.
    rental.start = new Date(startDateObj.value);
    rental.end = new Date(endDateObj.value);
    if (moment(rental.start).add(timezoneOffset, 'hours').hour() === 0
        && moment(rental.end).add(timezoneOffset, 'hours').hour() === 0) {
      rental.start = moment(rental.start).add(7, 'hours').toDate();
      rental.end = moment(rental.end).add(7, 'hours').toDate();
      ReactionCore.Log.info('Timezone updated during new order hook');
    }
    // TODO: Make sure that this diff is identical to the number of rental days always.
    rental.tripLength = moment(rental.start).diff(moment(rental.end), 'days');
    return rental;
  }
  return false;
}

function getShippingBuffers() {
  let advancedFulfillment = ReactionCore.Collections.Packages.findOne({name: 'reaction-advanced-fulfillment'});
  if (advancedFulfillment && advancedFulfillment.settings && advancedFulfillment.settings.buffer) {
    return advancedFulfillment.settings.buffer;
  }
  return {shipping: 0, returning: 0};
}

function getBundleVariant(productId, color, size, qty, customerName) {
  let product = ReactionCore.Collections.Products.findOne(productId);
  if (product && size && color) {
    let variant = _.findWhere(product.variants, {size: size, color: color});
    return createOrderItem(productId, variant, qty, customerName); // This is where QTY gets screwed up.
  }
  return false;
}

function setupOrderItems(lineItems, orderNumber) {
  // TODO: Consider abstracting this into two separate functions.
  const bundleIds = _.pluck(Bundles.find().fetch(), 'shopifyId');
  const productIds = _.pluck(Products.find().fetch(), 'shopifyId');
  let items = [];
  let otherItems = [];
  let skiPackages = [];
  let kayaksRented = 0;
  let bundleMissingColor = false;
  let rushShipping = {
    qty: 0,
    subtotal: 0
  };
  let damageCoverage = {
    packages: {
      qty: 0,
      subtotal: 0
    },
    products: {
      qty: 0,
      subtotal: 0
    }
  };
  _.each(lineItems, function (item) {
    // Setting the ski Vendors that mark if they ski packages
    let skiVendors = ['Black Tie', 'Ski Butlers'];
    // Check to see  if product_id exists in our bundIds array
    if (_.contains(bundleIds, item.product_id + '')) {
      let bundle = Bundles.findOne({shopifyId: item.product_id + ''});
      if (item.properties.length === 0) {
        ReactionCore.Log.error('CS created order ' + orderNumber);
        let defaultColor = _.keys(bundle.colorWays)[0];
        let defaultColorWay = bundle.colorWays[defaultColor];
        let customerObj = _.findWhere(item.properties, {name: 'For'});
        let customerName;
        if (customerObj) {
          customerName = customerObj.value;
        }
        let productTypes = [
          'jacketId',
          'pantsId',
          'glovesId',
          'stdGogglesId'
        ];
        _.each(productTypes, function (productType) {
          items.push({
            _id: Random.id(),
            shopId: ReactionCore.getShopId(),
            productId: defaultColorWay[productType],
            quantity: item.quantity,
            customerName: customerName,
            workflow: {
              status: 'orderCreated',
              workflow: ['inventoryAdjusted']
            }
          });
        });
        if (defaultColorWay.midlayerId) {
          items.push(
            {
              _id: Random.id(),
              shopId: ReactionCore.getShopId(),
              productId: defaultColorWay.midlayerId,
              quantity: item.quantity,
              customerName: customerName,
              workflow: {
                status: 'orderCreated',
                workflow: ['inventoryAdjusted']
              }
            });
        }
        return;
      }
      let color = _.findWhere(item.properties, {name: 'Color'});
      let customerObj = _.findWhere(item.properties, {name: 'For'});
      let customerName;
      if (customerObj) {
        customerName = customerObj.value;
      }
      if (color) {
        color = keyify(color.value);
      } else {
        ReactionCore.Log.error('Order ' + orderNumber + ' contains an item missing colors');
        bundleMissingColor = true;
        let colorOptions = _.keys(bundle.colorWays);
        color = keyify(colorOptions[0]);
      }

      if (color === 'aquaStoneBlack') {
        color = 'aquastoneBlack';
      }

      let style = bundle.colorWays[color]; // call the bundle + colorway a style;
      let size = {
        jacket: normalizeSize(_.findWhere(item.properties, {name: 'Jacket Size'}).value.trim()),
        midlayer: normalizeSize(_.findWhere(item.properties, {name: 'Jacket Size'}).value.trim()),
        pants: normalizeSize(_.findWhere(item.properties, {name: 'Pants Size'}).value.trim()),
        gloves: normalizeSize(_.findWhere(item.properties, {name: 'Gloves Size'}).value.trim())
      };

      let goggleChoice  = _.findWhere(item.properties, {name: 'Goggles Choice'});
      if (goggleChoice) {
        goggleChoice = goggleChoice.value.trim();
      } else {
        goggleChoice = 'Standard';
      }
      let goggleType = goggleChoice === 'Over Glasses' ? 'otg' : 'std';
      let goggleVariantItem = getBundleVariant(style[goggleType + 'GogglesId'], style[goggleType + 'GogglesColor'], 'One Size', item.quantity, customerName);
      // let goggleVariantItem = getBundleVariant(style[goggleType + 'GogglesId'], style[goggleType + 'GogglesColor'], 'STD');
      if (goggleVariantItem) {
        items.push(goggleVariantItem);
      } else {
        missingItem = true;
      }

      let productTypes = ['jacket', 'pants', 'midlayer', 'gloves'];
      _.each(productTypes, function (productType) {
        let variantItem = getBundleVariant(style[productType + 'Id'], style[productType + 'Color'], size[productType], item.quantity, customerName);
        if (variantItem) {
          items.push(variantItem);
        } else {
          missingItem = true;
        }
      });
    } else if (_.contains(productIds, item.product_id + '')) {
      let colorObj = _.findWhere(item.properties, {name: 'Color'});
      let color = '';
      if (colorObj) {
        color = colorObj.value.trim();
      }
      let customerObj = _.findWhere(item.properties, {name: 'For'});
      let customerName;
      if (customerObj) {
        customerName = customerObj.value;
      }
      let size = '';
      let sizeObj = _.find(item.properties, function (prop) {
        return prop.name.indexOf('Size') > 1;
      });
      if (sizeObj && sizeObj !== 'unselected') {
        size = sizeObj.value.trim();
      }

      // Strip HTML tags
      size = stripTags(size);
      color = stripTags(color);

      // Find size and color of baselayer items
      if (item.variant_title && _.contains(['XXS', 'XS', 'Extra Small', 'Small', 'Medium', 'Large', 'Extra Large', 'XL', 'XXL'], item.variant_title.trim())) {
        size = item.variant_title.trim();
        color = item.title.match(/\W-\W([A-Za-z\W]*)/)[1];
      }

      if (color === 'Bottom' || color.indexOf('Top') !== -1) {
        color = 'Black';
      }

      // Correct for shopify products including product title in color
      if (color.indexOf('Amped') !== -1 || color.indexOf('Fray') !== -1) {
        color = color.replace('Amped', '').trim();
      }
      if (color.indexOf('Fray') !== -1) {
        color = color.replace('Fray', '').trim();
      }

      // Normalize Size - Correct for shopify products having 'XS' or 'XL' as a size
      size = normalizeSize(size);

      // Fix Shopify not having 'True Black' as Burton Black color
      if (item.vendor === 'Burton' && color === 'Black') {
        color = 'True Black';
      }

      // Fix Shopify goggles not having a size
      if (item.title.indexOf('Goggles') !== -1 && !size) {
        size = 'One Size';
      }

      let product = Products.findOne({shopifyId: item.product_id + ''});
      let variant;

      if (product) {
        variant = _.findWhere(product.variants, {size: size, color: color});
      }
      let newItem;
      if (!variant) {
        newItem = {
          _id: Random.id(),
          shopId: ReactionCore.getShopId(),
          productId: product._id,
          quantity: item.quantity,
          customerName: customerName,
          workflow: {
            status: 'orderCreated',
            workflow: ['inventoryAdjusted']
          }
        };
      } else {
        newItem = {
          _id: Random.id(),
          shopId: ReactionCore.getShopId(),
          productId: product._id,
          quantity: item.quantity,
          customerName: customerName,
          variants: variant,
          workflow: {
            status: 'orderCreated',
            workflow: ['inventoryAdjusted']
          }
        };
      }
      items.push(newItem);
    } else if (item.title === 'Damage Coverage' || item.title === 'Damage Coverage for Packages') {
      let qty = item.quantity;
      let price = parseInt(item.price, 10);

      if (item.title === 'Damage Coverage for Packages') {
        damageCoverage.packages.qty += qty;
        damageCoverage.packages.subtotal += price;
      }
      if (item.title === 'Damage Coverage') {
        damageCoverage.products.qty += qty;
        damageCoverage.products.subtotal += price;
      }
    } else if (_.contains(skiVendors, item.vendor)) {
      let variant = item.variant_title;
      let variantSplit = variant.split(' ');
      let helmet = _.contains(variantSplit, 'With');
      let skiPackage = {
        _id: Random.id(),
        vendor: item.vendor,
        packageName: item.name,
        variantTitle: item.variant_title,
        helmet: helmet,
        rentalLength: parseInt(variantSplit[0], 10) || 0,
        qty: item.quantity,
        price: parseFloat(item.price, 10),
        packageType: item.title.split(' |')[0]
      };
      let properties = item.properties;
      let customer = _.findWhere(properties, {name: 'For'});
      if (customer) {
        skiPackage.customerName = customer.value;
      }
      let gender = _.findWhere(properties, {name: 'Gender'});
      if (gender) {
        skiPackage.gender = gender.value;
      }
      let heightInFeet = _.findWhere(properties, {name: 'Height Feet'});
      let heightInInches = _.findWhere(properties, {name: 'Height Inches'});
      if (heightInFeet && heightInInches) {
        skiPackage.height = heightInFeet.value + ' ft ' + heightInInches.value + ' in';
      }
      let weight = _.findWhere(properties, {name: 'Weight'});
      let weightUnits = _.findWhere(properties, {name: 'Weight Units'});
      if (weight && weightUnits) {
        skiPackage.weight = weight.value + ' ' + weightUnits.value;
      }
      skiPackages.push(skiPackage);
    } else if (item.vendor === 'Oru Kayak') {
      kayaksRented += item.quantity;
    } else if (item.title === 'Rush Shipping') {
      let qty = item.quantity;
      let price = parseInt(item.price, 10);
      rushShipping.qty += qty;
      rushShipping.subtotal += price;
    } else {
      if (!item.vendor) {
        item.vendor = 'GetOutfitted';
      }
      let other = {
        product: item.title,
        price: parseFloat(item.price, 10),
        qty: parseInt(item.quantity, 10),
        vendor: item.vendor,
        variantTitle: item.variant_title
      };
      otherItems.push(other);
    }
  });
  return {
    items: items,
    bundleMissingColor: bundleMissingColor,
    damageCoverage: damageCoverage,
    skiPackages: skiPackages,
    kayaksRented: kayaksRented,
    rushShipping: rushShipping,
    other: otherItems
  };
}

/**
 * setupAdvancedFulfillmentItems
 * @param   {Array} items - Array of existing items - reactionOrder.items by default
 * @returns {Object} - returns object with advancedFulfillment items and the itemMissingDetails flag
 */
function setupAdvancedFulfillmentItems(items) {
  let itemMissingDetails = false; // Flag we will pass back
  if (items.length > 0) {
    let afItems = _.map(items, function (item) {
      let product = Products.findOne(item.productId);
      if (item.variants) {
        // TODO: refactor - shouldn't need an ID, or duplicate existing fields
        return {
          _id: item._id,
          productId: item.productId,
          shopId: item.shopId,
          quantity: item.quantity,
          variantId: item.variants._id,
          price: item.variants.price,
          sku: item.variants.sku,
          customerName: item.customerName,
          location: item.variants.location,
          itemDescription: product.gender + ' - ' + product.vendor + ' - ' + product.title,
          workflow: {
            status: 'In Stock',
            workflow: []
          }
        };
      }
      itemMissingDetails = true;
      let description = 'Product Not Found';
      if (product) {
        description = product.gender + ' - ' + product.vendor + ' - ' + product.title;
      }
      return {
        _id: item._id,
        productId: item.productId,
        shopId: item.shopId,
        quantity: item.quantity,
        itemDescription: description,
        customerName: item.customerName,
        workflow: {
          status: 'In Stock',
          workflow: []
        }
      };
    });

    return {afItems: afItems, itemMissingDetails: itemMissingDetails};
  }
  return {afItems: [], itemMissingDetails: itemMissingDetails};
}

function determineLocalDelivery(order) {
  let zip = order.shipping_address.zip;
  let localZips = [
    '80424',
    '80435',
    '80443',
    '80497',
    '80498',
    '81657',
    '81620',
    '81657'
  ];
  return _.contains(localZips, zip);
}

function determineTransitTime(order, fedexTransitTime, buffersShipping) {
  if (determineLocalDelivery(order)) {
    return 0;
  }
  if (typeof fedexTransitTime === Number) {
    return fedexTransitTime;
  }
  return buffersShipping;
}

function rushDelivery(reactionOrder) {
  let localDelivery = reactionOrder.advancedFulfillment.localDelivery;
  if (localDelivery) {
    return false;
  }
  let todaysDate = new Date();
  let arriveByDate = reactionOrder.advancedFulfillment.arriveBy;
  let transitTime = reactionOrder.advancedFulfillment.transitTime - 1; // Fedex + 1

  let shipDate = moment(todaysDate).startOf('day').add(transitTime, 'days'); // shipDate as start of day
  let daysBetween = moment(shipDate).diff(arriveByDate);
  return daysBetween > 0;
}

function realisticShippingChecker(reactionOrder) {
  let arriveBy = reactionOrder.advancedFulfillment.arriveBy;
  let shipDate = reactionOrder.advancedFulfillment.shipmentDate;
  let possible = moment(arriveBy).diff(shipDate, 'days');
  return possible < 0;
}

function createReactionOrder(order) {
  check(order, Object);

  const orderExists = ReactionCore.Collections.Orders.findOne({shopifyOrderNumber: parseInt(order.order_number, 10)});
  if (orderExists) {
    ReactionCore.Log.warn('Import of order #' + order.order_number + ' aborted because it already exists');
    return false;
  }
  const orderStatus = order.fulfillment_status === 'fulfilled' ? 'orderShipped' : 'orderCreated';
  const notes = order.note_attributes;
  const rental = setupRentalFromOrderNotes(notes); // Returns start, end, and triplength of rental or false
  const buffers = getShippingBuffers();
  const fedexTransitTime = getFedexTransitTime(order.shipping_address || order.billing_address);
  if (fedexTransitTime) {
    buffers.shipping = fedexTransitTime + 1; // Update buffer to use fedexTransitTime +1 (1 extra day for arrival day)
  }
  let orderItems = setupOrderItems(order.line_items, order.order_number);
  // Initialize reaction order
  let kayaks = {
    vendor: 'Oru Kayak',
    qty: orderItems.kayaksRented
  };
  let reactionOrder = {
    shopifyOrderNumber: order.order_number,
    shopifyOrderId: order.id,
    shopifyOrderCreatedAt: new Date(order.created_at),
    email: order.email,
    shopId: ReactionCore.getShopId(),
    userId: Random.id(),
    shipping: generateShippingAddress(order),
    billing: generateBillingAddress(order),
    startTime: rental.start,
    endTime: rental.end,
    orderNotes: order.note,
    infoMissing: false,                   // Missing info flag (dates, etc)
    itemMissingDetails: false,            // Missing item information flag (color, size, etc)
    bundleMissingColor: orderItems.bundleMissingColor,
    items: orderItems.items,
    advancedFulfillment: {
      shipmentDate: new Date(),           // Initialize shipmentDate to today
      returnDate: new Date(2100, 8, 20),  // Initialize return date to 85 years from now
      localDelivery: determineLocalDelivery(order),
      arriveBy: arrivalDateChecker(moment(rental.start).subtract(1, 'days').toDate(), determineLocalDelivery(order)),
      shipReturnBy: returnChecker(moment(rental.end).add(1, 'days').toDate(), determineLocalDelivery(order)),
      transitTime: determineTransitTime(order, fedexTransitTime, buffers.shipping),
      damageCoverage: orderItems.damageCoverage,
      skiPackages: orderItems.skiPackages,
      skiPackagesPurchased: orderItems.skiPackages.length > 0,
      workflow: {
        status: orderStatus
      },
      paymentInformation: {
        totalPrice: parseFloat(order.total_price),
        totalTax: parseFloat(order.total_tax),
        subtotalPrice: parseFloat(order.subtotal_price),
        totalDiscount: parseFloat(order.total_discounts),
        totalItemsPrice: parseFloat(order.total_line_items_price),
        discountCodes: order.discount_codes,
        refunds: order.refunds
      },
      canceledInformation: {
        canceledAt: new Date(order.cancelled_at),
        reason: order.cancel_reason
      }
    }
  };

  let afDetails = setupAdvancedFulfillmentItems(reactionOrder.items);
  reactionOrder.advancedFulfillment.items = afDetails.afItems;
  reactionOrder.itemMissingDetails = afDetails.itemMissingDetails;
  if (reactionOrder.advancedFulfillment.localDelivery) {
    buffers.shipping = 1;
  }
  if (!rental) {
    ReactionCore.Log.error('Importing Shopify Order #' + order.order_number + ' - Missing Rental Dates ');
    reactionOrder.infoMissing = true; // Flag order
  } else {
    reactionOrder.advancedFulfillment.shipmentDate = shipmentDateChecker(
      moment(rental.start).subtract(buffers.shipping, 'days').toDate(),
      determineLocalDelivery(order),
      determineTransitTime(order, fedexTransitTime, buffers.shipping));
    reactionOrder.advancedFulfillment.returnDate = returnChecker(moment(rental.end).add(buffers.returning, 'days').toDate(), determineLocalDelivery(order));
  }
  reactionOrder.advancedFulfillment.rushDelivery = rushDelivery(reactionOrder);
  if (reactionOrder.advancedFulfillment.rushDelivery && !reactionOrder.advancedFulfillment.localDelivery) {
    reactionOrder.advancedFulfillment.shipmentDate = rushShipmentChecker(new Date());
  }
  if (kayaks.qty > 0) {
    reactionOrder.advancedFulfillment.kayakRental = kayaks;
  }

  if (orderItems.rushShipping.qty > 0) {
    reactionOrder.advancedFulfillment.rushShippingPaid = orderItems.rushShipping;
  }
  if (orderItems.other.length > 0) {
    reactionOrder.advancedFulfillment.other = orderItems.other;
  }

  reactionOrder.advancedFulfillment.impossibleShipDate = realisticShippingChecker(reactionOrder);
  ReactionCore.Log.info('Importing Shopify Order #'
    + order.order_number
    + ' - Rental Dates '
    + rental.start
    + ' to '
    + rental.end);
  return ReactionCore.Collections.Orders.insert(reactionOrder);
}

function saveOrdersToShopifyOrders(data) {
  check(data, Object);
  _.each(data.orders, function (order) {
    ReactionCore.Collections.ShopifyOrders.update({
      shopifyOrderNumber: parseInt(order.order_number, 10)
    }, {
      $set: {
        shopifyOrderNumber: parseInt(order.order_number, 10),
        information: order,
        importedAt: new Date()
      }
    }, {
      upsert: true
    });
  });
}

function saveShopifyOrder(order) {
  check(order, Object);
  ReactionCore.Collections.ShopifyOrders.update({
    shopifyOrderNumber: parseInt(order.order_number, 10)
  }, {
    $set: {
      shopifyOrderNumber: parseInt(order.order_number, 10),
      information: order,
      importedAt: new Date()
    }
  }, {
    upsert: true
  });
}


Meteor.methods({
  'shopifyOrder/count': function () {
    let shopifyOrders = ReactionCore.Collections.Packages.findOne({name: 'reaction-shopify-orders'});
    if (shopifyOrders.settings.shopify.key && shopifyOrders.settings.shopify.password && shopifyOrders.settings.shopify.shopname) {
      let key = shopifyOrders.settings.shopify.key;
      let password = shopifyOrders.settings.shopify.password;
      let shopname = shopifyOrders.settings.shopify.shopname;
      let result = 0;

      let params = {};
      if (shopifyOrders.settings.public) {
        let lastDate = formatDateForApi(shopifyOrders.settings.public.lastUpdated);
        if (lastDate) {
          params = _.extend(params, {created_at_min: lastDate});
        }
      }
      result = HTTP.get('https://' + shopname + '.myshopify.com/admin/orders/count.json', {
        auth: key + ':' + password,
        params: params
      });

      ReactionCore.Collections.Packages.update({_id: shopifyOrders._id}, {
        $set: {
          'settings.public.ordersSinceLastUpdate': result.data.count
        }
      });
    }
  },
  'shopifyOrders/updateTimeStamp': function (date) {
    check(date, Date);
    ReactionCore.Collections.Packages.update({
      name: 'reaction-shopify-orders'
    }, {
      $set: {'settings.public.lastUpdated': date}
    });
  },
  'shopifyOrders/newOrder': function (order) {
    check(order, Match.Any);
    if (this.connection === null) {
      saveShopifyOrder(order);
      createReactionOrder(order);
    } else {
      throw new Meteor.Error(403, 'Forbidden, method is only available from the server');
    }
  },
  'shopifyOrders/getOrders': function () {
    let date = new Date();
    let shopifyOrders = ReactionCore.Collections.Packages.findOne({name: 'reaction-shopify-orders'});
    let key = shopifyOrders.settings.shopify.key;
    let password = shopifyOrders.settings.shopify.password;
    let shopname = shopifyOrders.settings.shopify.shopname;
    let orderCount = shopifyOrders.settings.public.ordersSinceLastUpdate;
    let numberOfPages = Math.ceil(orderCount / 50);
    let pageNumbers = _.range(1, numberOfPages + 1);
    let lastDate = formatDateForApi(shopifyOrders.settings.public.lastUpdated);

    let params = {};
    if (lastDate) {
      params = _.extend(params, {created_at_min: lastDate});
    }

    _.each(pageNumbers, function (pageNumber) {
      let result = HTTP.get('https://' + shopname + '.myshopify.com/admin/orders.json', {
        auth: key + ':' + password,
        params: _.extend(params, {page: pageNumber})
      }).data;
      saveOrdersToShopifyOrders(result);
      _.each(result.orders, function (order) {
        createReactionOrder(order);
      });
    });

    Meteor.call('shopifyOrders/updateTimeStamp', date);
    return true;
  }
});
