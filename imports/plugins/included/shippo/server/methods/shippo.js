/* eslint camelcase: 0 */
import { Reaction } from "/server/api";
import { Packages, Accounts, Shops, Shipping } from "/lib/collections";
import { ShippoPackageConfig } from "../../lib/collections/schemas";
import { Cart as CartSchema } from "/lib/collections/schemas";
import { ShippoApi } from "./shippoapi";

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

function createShippoParcel(reactionParcel/*, distance_unit, weight_unit*/) {
  const shippoParcel = {
    "width": reactionParcel.width || "",
    "length": reactionParcel.length || "",
    "height": reactionParcel.height || "",
    "weight": reactionParcel.weight || "",
    "distance_unit": "cm", //Propably we need to have for each shop a uom/baseuom for distance
    "mass_unit": "kg"
  };
  return shippoParcel;
}

function formatShippoRates( shippoRates ) {
  shippoRates.map( rate => ({label: rate.service.level_name }) );
}

// // usps_express to U
// function formatCarrierLabel( carrierName) {
//   carrierName.split('_').map( el => el..charAt(0).toUpperCase();)
// }

// Creates Shippo Shippings Providers in Shipping Collection for the current Shop
function createShippoShippingProviders(carriers) {
  const shippoProvider = Shipping.findOne({
    "shopId": Reaction.getShopId(),
    "shippoProvided": true
  });

  carriers.forEach( carrier => {
    Shipping.insert({
      name: "Shippo Shipping provider",
      methods: [],
      provider: {
        serviceAuth: "shippo",
        name: carrier.account_id,
        label: carrier.carrier,
        enabled: true
      },
      shopId: Reaction.getShopId()
    });
  });
};



Meteor.methods({

  "shippo/updateApiKey"(modifier, _id) {
    // Important server-side check for security and data integrity
    check(modifier, ShippoPackageConfig);
    check(_id, String);

    // If user wants to delete existing key
    if (modifier.hasOwnProperty("$unset")) {
      const customModifier = { $set: { "settings.apiKey": null } };
      Packages.update(_id, customModifier);
      return { type: "delete" };
    }

    const apiKey = modifier.$set["settings.apiKey"];

    // Tries to use the apiKey . if not possible throws a relative Meteor Error
    ShippoApi.methods.confirmValidApiKey.call({ apiKey });
    Packages.update(_id, modifier);
    // if Shippo Provider doesn't exist create it
    const shippoCarriersList = ShippoApi.methods.getActiveCarriersList.call({});
    createShippoShippingProviders(shippoCarriersList);

    return { type: "update" };
  },
  "shippo/getCarriersRatesForCart"(cart) {  // Intended to be called from Buyer ..concern for serurity problems
    check(cart, CartSchema);
    const purpose = "QUOTE";
    const shop = Shops.findOne({ _id: cart.shopId },
                               { fields: { addressBook: 1, emails: 1 } });
    const addressFrom = createShippoAddress(shop.addressBook[0], shop.emails[0].address, purpose);

    const buyer = Accounts.findOne({ _id: cart.userId }, { fields: { emails: 1} });
    const addressTo = createShippoAddress(cart.billing[0].address, buyer.emails[0].address, purpose);

    const parcel = createShippoParcel(cart.items[0].parcel);
    const shippoRatesResult = ShippoApi.methods.getCarriersRates.call({ addressFrom, addressTo, parcel, purpose });
    return formatShippoRates(shippoRatesResult);
  },
  "shippo/getCarriersRatesForOrder"(order) { // intended to be called from Seller

  }
});
