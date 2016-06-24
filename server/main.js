// import Fixtures from "./fixtures";  // TODO: get this working!
import "./methods"; // TODO: refactor all of the methods to use import/export
// import Publications from "./publications";  // TODO: wrap each file in a closure

import Security from "./security";
import Startup from "./startup";
// import "/imports/server";

// Fixtures();
// Methods();
// Publications();
Security();
Meteor.startup(() => Startup());


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
import "/imports/plugins/included/stripe/server";

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
import "/imports/plugins/included/stripe/register";
