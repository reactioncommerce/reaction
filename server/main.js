import "./methods"; // TODO: refactor all of the methods to use import/export
import Startup from "./startup";
import Security from "./security";

Meteor.startup(() => {
  Startup();
  Security();
});


/**
 * Plugin imports
 */
import "/imports/plugins/core/checkout/server";
import "/imports/plugins/core/orders/server";

import "/imports/plugins/included/analytics/server";
import "/imports/plugins/included/inventory/server";
import "/imports/plugins/included/paypal/server";
import "/imports/plugins/included/shipping/server";
import "/imports/plugins/included/social/server";
// Payment Methods
import "/imports/plugins/included/stripe/server";
import "/imports/plugins/included/example-paymentmethod/server";
import "/imports/plugins/included/authnet/server";
import "/imports/plugins/included/braintree/server";
import "/imports/plugins/included/email-notifications/server";

/**
 * Plugin Registry
 */
import "/imports/plugins/core/checkout/register";
import "/imports/plugins/core/dashboard/register";
import "/imports/plugins/core/layout/register";
import "/imports/plugins/core/orders/register";
import "/imports/plugins/core/ui/register";

import "/imports/plugins/included/analytics/register";
import "/imports/plugins/included/inventory/register";
import "/imports/plugins/included/paypal/register";
import "/imports/plugins/included/product-variant/register";
import "/imports/plugins/included/shipping/register";
import "/imports/plugins/included/social/register";
// Payment Methods
import "/imports/plugins/included/stripe/register";
import "/imports/plugins/included/example-paymentmethod/register";
import "/imports/plugins/included/authnet/register";
import "/imports/plugins/included/braintree/register";
import "/imports/plugins/included/email-notifications/register";
