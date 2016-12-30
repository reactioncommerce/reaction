/* eslint camelcase: 0 */
import { Reaction } from "/server/api";
import { Packages, Accounts, Shops, Shipping, Cart } from "/lib/collections";
import { ShippoPackageConfig } from "../../lib/collections/schemas";
// import { Cart as CartSchema } from "/lib/collections/schemas";
import { ShippoApi } from "./shippoapi";

// Creates an address (for sender or recipient) suitable for Shippo Api Calls
function createShippoAddress(reactionAddress, email, purpose) {
  const shippoAddress = {
    object_purpose: purpose,
    name: reactionAddress.fullName,
    street1: reactionAddress.address1,
    street2: reactionAddress.address2 || "", // "" in order to be cleaned later by SimpleSchema.clean
    city: reactionAddress.city,
    company: reactionAddress.company || "",
    state: reactionAddress.region,
    zip: reactionAddress.postal,
    country: reactionAddress.country,
    phone: reactionAddress.phone,
    email: email,
    is_residential: !reactionAddress.isCommercial
  };

  return shippoAddress;
}

function createShippoParcel(reactionParcel, reactionMassUnit, reactionDistanceUnit) {
  const shippoParcel = {
    width: reactionParcel.width || "",
    length: reactionParcel.length || "",
    height: reactionParcel.height || "",
    weight: reactionParcel.weight || "",
    distance_unit: reactionDistanceUnit.toLowerCase(), // Propably we need to have for each shop a uom/baseuom for distance
    mass_unit: reactionMassUnit.toLowerCase()
  };
  return shippoParcel;
}

// converts the Rates List fetched from the Shippo Api to ShippingMethod form
function createShippingMethodsFromRatesList(shippoRates) {
  return shippoRates.map(rate => ({
    name: rate.servicelevel_token, // eg USPS_priority_mail
    label: `${rate.provider} - ${rate.servicelevel_name}`, // eg USPS - Priority mail
    enabled: true,
    rate: rate.amount,
    handling: 0 // we could get that from a corresponding property of the Shipping document
  }));
}


// usps_express to USPS EXPRESS .We need a better approach
function formatCarrierLabel( carrierName) {
  return carrierName.replace(/_/g," ").toUpperCase();
}

// Creates Shippo Shippings Providers in Shipping Collection for the current Shop
function createShippoShippingProviders(carriers) {
  carriers.forEach(carrier => {
    const carrierName = carrier.carrier;
    const carrierLabel = formatCarrierLabel(carrierName);
    Shipping.insert({
      name: `${carrierLabel} through Shippo`,
      methods: [],
      provider: {
        name: carrierName,
        label: carrierLabel,
        enabled: true
      },
      shippoShippingProvider: {
        isShippoShippingProvider: true,
        objectId: carrier.object_id
      },
      shopId: Reaction.getShopId()
    });
  });
}

function removeShippoShippingProviders() {
  Shipping.remove({
    "shopId": Reaction.getShopId(),
    "shippoShippingProvider.isShippoShippingProvider": true
  });
}

Meteor.methods({
  "shippo/updateApiKey"(modifier, _id) {
    // Important server-side check for security and data integrity
    check(modifier, ShippoPackageConfig);
    check(_id, String);

    // Make sure that the user has proper rights to this package
    const shopId = Packages.findOne({ _id }, { field: { shopId: 1 } }).shopId;
    if (shopId && Roles.userIsInRole(this.userId, ["admin", "owner"], shopId)) {
      // If user wants to delete existing key
      if (modifier.hasOwnProperty("$unset")) {
        const customModifier = { $set: { "settings.apiKey": null } };
        Packages.update(_id, customModifier);
        removeShippoShippingProviders();
        return { type: "delete" };
      }

      const apiKey = modifier.$set["settings.apiKey"];

      // Tries to use the apiKey . if not possible throws a relative Meteor Error
      ShippoApi.methods.confirmValidApiKey.call({ apiKey });
      Packages.update(_id, modifier);

      const shippoActiveCarriersList = ShippoApi.methods.getActiveCarriersList.call({});
      removeShippoShippingProviders();
      createShippoShippingProviders(shippoActiveCarriersList);

      return { type: "update" };
    }
  },
  // Intended to be called from Buyer
  "shippo/getShippingMethodsForCart"(cartId) {
    check(cartId, String);

    const cart = Cart.findOne(cartId);
    if (cart && cart.userId === this.userId) { // confirm user has the right
      let shippoAddressFrom;
      let shippoAddressTo;
      let shippoParcel;
      const purpose = "QUOTE";

      const shop = Shops.findOne({
        _id: cart.shopId
      }, {
        field: {
          addressBook: 1,
          emails: 1,
          unitsOfMeasure: { $elemMatch: { default: true} }
        }
      });

      shippoAddressFrom = createShippoAddress(shop.addressBook[0], shop.emails[0].address, purpose);
      // product in the cart has to have parcel property with the dimensions
      if (cart.items && cart.items && cart.items[0] && cart.items[0].parcel) {
        const massUnit = shop && shop.unitsOfMeasure && shop.unitsOfMeasure[0].uom || "KG";
        // at the moment shops don't have a kind of unitOfMeasure for distance
        // so we put CM...
        shippoParcel = createShippoParcel(cart.items[0].parcel, massUnit, "CM");
      } else {
        return [];
      }

      const buyer = Accounts.findOne({
        _id: this.userId
      }, {
        field: { emails: 1 }
      });
      // check that there is address available in cart
      if (cart.shipping && cart.shipping[0] && cart.shipping[0].address) {
        shippoAddressTo = createShippoAddress(cart.shipping[0].address, buyer.emails[0].address, purpose);
      } else {
        return [];
      }

      const shippoRates = ShippoApi.methods.getCarriersRates.call({ shippoAddressFrom, shippoAddressTo, shippoParcel, purpose });
      return createShippingMethodsFromRatesList(shippoRates);
    }
    // ,
    // "shippo/getCarriersRatesForOrder"(order) { // intended to be called from Seller
    //
    // }


    }

});
