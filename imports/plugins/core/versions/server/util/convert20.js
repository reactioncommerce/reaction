/**
 * Reaction 2.0 conversions
 */

/**
 * @param {Object} cart The cart document to transform
 * @returns {Object} The converted cart document
 */
export function convertCart(cart) {
  const convertedCart = { ...cart };

  // Set `cart.billingAddress`
  if (!cart.billingAddress && Array.isArray(cart.billing) && cart.billing[0]) {
    convertedCart.billingAddress = cart.billing[0].address;
    if (!convertedCart.billingAddress) delete convertedCart.billingAddress;
  }

  // Delete removed props
  delete convertedCart.tax;
  delete convertedCart.taxes;
  delete convertedCart.taxRatesByShop;

  // Remove everything from billing array unless it's a discount
  if (Array.isArray(cart.billing)) {
    convertedCart.billing = cart.billing.reduce((list, payment) => {
      if (payment.paymentMethod && (payment.paymentMethod.processor === "code" || payment.paymentMethod.processor === "rate")) {
        list.push({
          _id: payment._id || payment.paymentMethod.id,
          amount: payment.paymentMethod.amount,
          createdAt: payment.createdAt || new Date(),
          currencyCode: cart.currencyCode || "USD",
          data: {
            discountId: payment.paymentMethod.id,
            code: payment.paymentMethod.code
          },
          displayName: `Discount Code: ${payment.paymentMethod.code}`,
          method: payment.paymentMethod.method,
          mode: "discount",
          name: payment.paymentMethod.processor === "code" ? "discount_code" : "discount_rate",
          paymentPluginName: payment.paymentMethod.processor === "code" ? "discount-codes" : "discount-rates",
          processor: payment.paymentMethod.processor,
          shopId: payment.shopId || cart.shopId,
          status: payment.paymentMethod.status || "created",
          transactionId: payment.paymentMethod.transactionId
        });
      } else if (payment.displayName) {
        // Previously converted. Keep it.
        list.push(payment);
      }
      return list;
    }, []);
  }

  return convertedCart;
}

/**
 * @summary Converts a single order item
 * @param {Object} item The order item document to transform
 * @returns {Object} The converted order item document
 */
function convertOrderItem(item) {
  const convertedItem = { ...item };

  delete convertedItem.product;
  delete convertedItem.variants;
  delete convertedItem.shippingMethod;

  if (!item.price && item.priceWhenAdded) {
    convertedItem.price = item.priceWhenAdded;
    delete convertedItem.priceWhenAdded;
  }

  convertedItem.subtotal = (item.quantity || 0) * (convertedItem.price.amount || 0);
  convertedItem.tax = convertedItem.subtotal * (convertedItem.taxRate || 0);

  return convertedItem;
}

/**
 * @summary Converts a single invoice object
 * @param {Object} invoice The invoice document to transform
 * @returns {Object} The converted invoice document
 */
function convertInvoice(invoice) {
  const discounts = invoice.discounts || 0;
  const taxes = invoice.taxes || 0;
  const preTaxTotal = Math.max(0, invoice.subtotal - discounts);
  const effectiveTaxRate = preTaxTotal > 0 && taxes > 0 ? taxes / preTaxTotal : 0;
  return {
    ...invoice,
    discounts,
    effectiveTaxRate,
    taxes
  };
}

/**
 * @summary Converts a single order fulfillment group
 * @param {Object} group The order fulfillment group document to transform
 * @param {Object} order The order document in which this group lives
 * @param {Object[]} packages Array of all Package docs from the database
 * @returns {Object} The converted order document
 */
function convertOrderFulfillmentGroup(group, order, packages) {
  // If already converted previously, leave it alone.
  if (group.items) {
    return group;
  }

  const convertedGroup = { ...group };

  // Add items to the group
  convertedGroup.items = (order.items || []).reduce((list, item) => {
    if (item.shopId === group.shopId) {
      list.push(convertOrderItem(item));
    }
    return list;
  }, []);

  // Set `itemIds` and `totalItemQuantity`
  let totalItemQuantity = 0;
  convertedGroup.itemIds = convertedGroup.items.map((item) => {
    totalItemQuantity += item.quantity || 0;
    return item._id;
  });
  convertedGroup.totalItemQuantity = totalItemQuantity;

  // Set `group.shipmentMethod.currencyCode`
  if (group.shipmentMethod && !group.shipmentMethod.currencyCode) {
    convertedGroup.shipmentMethod.currencyCode = order.currencyCode || "USD";
  }

  // Convert group.invoice
  if (group.invoice) {
    convertedGroup.invoice = convertInvoice(group.invoice);
  }

  // Set `group.payment`. There is a `paymentId` that should point at the _id in `order.billing` array
  if (group.paymentId) {
    const payment = (order.billing || []).find((billingItem) => billingItem._id === group.paymentId);
    if (payment && payment.paymentMethod) {
      let paymentPluginName = "unknown";
      let name = "unknown";
      if (payment.paymentMethod.paymentPackageId) {
        const pkg = packages.find((pkgDoc) => pkgDoc._id === payment.paymentMethod.paymentPackageId);
        if (pkg) {
          paymentPluginName = pkg.name;
          if (paymentPluginName === "reaction-stripe") {
            name = "stripe_card";
          } else if (paymentPluginName === "example-paymentmethod") {
            name = "iou_example";
          }
        }
      }

      convertedGroup.payment = {
        _id: payment._id,
        address: payment.address,
        amount: payment.paymentMethod.amount,
        createdAt: payment.createdAt || new Date(),
        currency: payment.currency,
        currencyCode: order.currencyCode || "USD",
        data: {
          billingAddress: payment.address,
          chargeId: payment.paymentMethod.transactionId
        },
        displayName: payment.paymentMethod.storedCard,
        invoice: payment.invoice ? convertInvoice(payment.invoice) : convertedGroup.invoice,
        method: payment.paymentMethod.method,
        mode: payment.paymentMethod.mode,
        name,
        paymentPluginName,
        processor: payment.paymentMethod.processor,
        riskLevel: payment.paymentMethod.riskLevel,
        shopId: payment.shopId,
        status: payment.paymentMethod.status,
        transactionId: payment.paymentMethod.transactionId,
        transactions: payment.paymentMethod.transactions
      };
    }
    delete convertedGroup.paymentId;

    if (!convertedGroup.invoice) {
      convertedGroup.invoice = convertedGroup.payment.invoice;
    }
  }

  delete convertedGroup.shipmentQuotes;
  delete convertedGroup.shipmentQuotesQueryStatus;

  return convertedGroup;
}

/**
 * @param {Object} order The order document to transform
 * @param {Object[]} packages Array of all Package docs from the database
 * @returns {Object} The converted order document
 */
export function convertOrder(order, packages) {
  const convertedOrder = { ...order };

  // Add `discounts` array to `order`. Take these from billing array.
  if (Array.isArray(order.billing)) {
    convertedOrder.discounts = order.billing.reduce((list, payment) => {
      if (payment.paymentMethod && (payment.paymentMethod.processor === "code" || payment.paymentMethod.processor === "rate")) {
        list.push({
          amount: payment.paymentMethod.amount,
          discountId: payment.paymentMethod.id
        });
      }
      return list;
    }, []);
    delete convertedOrder.billing;
  }

  // Convert all the fulfillment groups
  if (Array.isArray(order.shipping)) {
    convertedOrder.shipping = order.shipping.map((group) => convertOrderFulfillmentGroup(group, order, packages));
  } else {
    convertedOrder.shipping = [];
  }

  // Set `order.totalItemQuantity`
  if (!order.totalItemQuantity) {
    convertedOrder.totalItemQuantity = (convertedOrder.shipping || []).reduce((sum, group) => sum + group.totalItemQuantity, 0);
  }

  delete convertedOrder.discount;
  delete convertedOrder.items;
  delete convertedOrder.taxRatesByShop;

  return convertedOrder;
}
