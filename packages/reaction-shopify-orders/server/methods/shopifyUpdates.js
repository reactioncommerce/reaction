Meteor.methods({
  'advancedFulfillment/updatedShopifyFulfillmentStatus': function (shopifyOrderId, order, userId) {
    check(shopifyOrderId, Number);
    check(order, Object);
    check(userId, String);
    if (shopifyOrderId !== order.shopifyOrderId) {
      throw new Error(403, 'shopify order number does not match');
    }
    let shopifyOrders = ReactionCore.Collections.Packages.findOne({name: 'reaction-shopify-orders'});
    let key = shopifyOrders.settings.shopify.key;
    let password = shopifyOrders.settings.shopify.password;
    let shopname = shopifyOrders.settings.shopify.shopname;
    let shopifyOrderIdStringify = shopifyOrderId + '';
    let shopifyImport = ShopifyOrders.findOne({shopifyOrderNumber: order.shopifyOrderNumber});

    if (!shopifyImport) {
      return false; // Exit method if original ShopifyImport order cannot be found
    }

    let fulfillmentStatus = shopifyImport.information.fulfillment_status;
    if (key && password && shopname) {
      if (fulfillmentStatus === null) {
        let params = {
          fulfillment: {
            tracking_number: 'LOCAL-DELIVERY',
            notify_customer: false
          }
        };
        HTTP.post('https://' +  shopname + '.myshopify.com/admin/orders/' + shopifyOrderIdStringify + '/fulfillments.json', {
          auth: key + ':' + password,
          data: params
        });
      } else if (fulfillmentStatus === 'partial') {
        let lineItems = shopifyImport.information.line_items;
        let unFulfilledItemIds = [];
        _.each(lineItems, function (lineItem) {
          if (lineItem.fulfillment_status === null) {
            let idObj = {id: lineItem.id};
            unFulfilledItemIds.push(idObj);
          }
        });
        let params = {
          fulfillment: {
            tracking_number: 'LOCAL-DELIVERY',
            notify_customer: false,
            line_items: unFulfilledItemIds
          }
        };
        try {
          HTTP.post('https://' +  shopname + '.myshopify.com/admin/orders/' + shopifyOrderIdStringify + '/fulfillments.json', {
            auth: key + ':' + password,
            data: params
          });
        } catch (e) {
          ReactionCore.Log.error('Error fulfilling items in shopify for order no: ' + order.shopifyOrderNumber, e);
        }
      }
    } else {
      throw new Error(403, 'Access Denied, invalid Credentials');
    }
  }
});
