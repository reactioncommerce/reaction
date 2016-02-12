function verifyPreSharedKey(key, service) {
  const shopifyOrders = ReactionCore.Collections.Packages.findOne({
    name: 'reaction-shopify-orders'
  });

  if (shopifyOrders && shopifyOrders.settings) {
    return key === shopifyOrders.settings[service].preSharedKey;
  }

  ReactionCore.Log.error('Error verifying preSharedKey because reaction-shopify-orders package or settigns not found ');
  return false;
}

Router.route('/webhooks/fulfillments/new', {
  where: 'server',
  name: 'webhooks.fulfillments.new',
  action: function () {
    let keyMatches = verifyPreSharedKey(this.request.query.key, 'shopify');

    if (keyMatches) {
      this.response.statusCode = 200;
      this.response.end('Success');

      const shopifyOrdersPackage = ReactionCore.Collections.Packages.findOne({
        name: 'reaction-shopify-orders'
      });
      const shopname = shopifyOrdersPackage.settings.shopify.shopname;
      const key = shopifyOrdersPackage.settings.shopify.key;
      const password = shopifyOrdersPackage.settings.shopify.password;

      let shopifyOrderNumber;
      // Get shopify order number from shopify API
      try {
        shopifyOrderNumber = HTTP.get('https://' + shopname + '.myshopify.com/admin/orders/' + this.request.body.order_id + '.json', {
          auth: key + ':' + password
        }).data.order.order_number;
      } catch (e) {
        ReactionCore.Log.error('Error in webhooks.fulfillments.new determining shopifyOrderNumber ' + e);
        // TODO: Add failed imports to queue to retry order import
        return false;
      }
      Meteor.call('shopifyOrders/newFulfillment', this.request.body, shopifyOrderNumber);
      ReactionCore.Log.info('Shopify New Fulfillment Webhook successfully processed FULFILLMENT for order number', shopifyOrderNumber);
      // TODO: add notification for CSR and Ops
    } else {
      this.response.statusCode = 403;
      this.response.end('Forbidden');
      ReactionCore.Log.warn('Shopify New Fulfillment Webhook failed - invalid signature: ',
        this.request.headers['x-forwarded-for'],
        this.request.headers['x-forwarded-host'],
        this.request.headers['x-shopify-hmac-sha256'],
        this.request.headers['x-generated-signature']);
    }
  }
});

Router.route('/webhooks/orders/new', {
  where: 'server',
  name: 'webhooks.orders.new',
  action: function () {
    let keyMatches = verifyPreSharedKey(this.request.query.key, 'shopify');

    if (keyMatches) {
      this.response.statusCode = 200;
      this.response.end('Success');
      Meteor.call('shopifyOrders/newOrder', this.request.body);
      ReactionCore.Log.info('Shopify Orders Webhook successfully processed NEW Order: #', this.request.body.order_number);
      // TODO: add notification for CSR and Ops
    } else {
      this.response.statusCode = 403;
      this.response.end('Forbidden');
      ReactionCore.Log.error('Shopify New Orders Webhook failed - invalid preSharedKey: ',
        this.request.headers['x-forwarded-for'],
        this.request.headers['x-forwarded-host'],
        this.request.query.key);
    }
  }
});

Router.route('/webhooks/orders/cancel', {
  where: 'server',
  name: 'webhooks.orders.cancel',
  action: function () {
    let keyMatches = verifyPreSharedKey(this.request.query.key, 'shopify');

    if (keyMatches) {
      this.response.statusCode = 200;
      this.response.end('Success');

      let order = ReactionCore.Collections.Orders.findOne({shopifyOrderId: this.request.body.id});
      Meteor.call('shopifyOrders/cancelOrder', order._id, '0x11111111');
      ReactionCore.Log.info('Shopify Cancel Order Webhook successfully processed CANCELLATION for order number', order.shopifyOrderNumber);
      // TODO: add notification for CSR and Ops
    } else {
      this.response.statusCode = 403;
      this.response.end('Forbidden');
      ReactionCore.Log.warn('Shopify Cancel Order Webhook failed - invalid signature: ',
        this.request.headers['x-forwarded-for'],
        this.request.headers['x-forwarded-host'],
        this.request.headers['x-shopify-hmac-sha256'],
        this.request.headers['x-generated-signature']);
    }
  }
});


Router.route('/webhooks/aftership/post', {
  where: 'server',
  name: 'webhooks.aftership.post',
  action: function () {
    let keyMatches = verifyPreSharedKey(this.request.query.key, 'aftership');

    if (keyMatches) {
      this.response.statusCode = 200;
      this.response.end('Success');
      Meteor.call('aftership/processHook', this.request.body);
      ReactionCore.Log.info('Aftership Post Webhook successfully processed ' + this.request.body.msg.tag + ' for Order: #', this.request.body.msg.order_id);
      // TODO: add notification for CSR and Ops
    } else {
      this.response.statusCode = 403;
      this.response.end('Forbidden');
      ReactionCore.Log.error('Aftership Post Webhook Webhook failed - invalid preSharedKey: ',
        this.request.headers['x-forwarded-for'],
        this.request.headers['x-forwarded-host'],
        this.request.query.key);
    }
  }
});
