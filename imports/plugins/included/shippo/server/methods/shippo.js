import { Packages, Accounts, Shops } from "/lib/collections";
import { ShippoPackageConfig } from "../../lib/collections/schemas";
import { ShippoApi } from "./shippoapi";

function createShippoAddress(address, email, purpose) {
  const shippoAddress = {
    "object_purpose" : purpose,
    "name": address.fullName,
    "street1": address.address1,
    "street2": address.address2,
    "city": address.city,
    "state": address.region,
    "zip": address.zip,
    "country": address.country,
    "phone": address.phone,
    "email": email,
    "is_residential": !address.isCommercial
  };

  return shippoAddress;
}

function createShippoParcel(parcel) {
  const shippoParcel = {
    "width": parcel.width,
    "length": parcel.length,
    "height": parcel.height,
    "weight": parcel.weight,
    "distance_unit": "in",
    "distance_weight": "lb"
  };
  return shippoParcel;
}

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
    return { type: "update" };
  },
  "shippo/getCarriersRatesForCart"(cart) {
    const purpose = "PURCHASE";
    const shop = Shops.findOne({ _id: cart.shopId },
                               { fields: {addressBook: 1, emails: 1}});
    const addressFrom = createShippoAddress( shop.addressBook[0], shop.emails[0].address, purpose);

    const buyer = Accounts.findOne({ _id: cart.userId}, { fields: {emails: 1}});
    const addressTo = createShippoAddress( cart.billing[0].address, buyer.emails[0].address, purpose);


    const parcel = createShippoParcel(cart.items[0].parcel);
    const rates = ShippoApi.methods.getCarriersRates.call({addressFrom, addressTo, parcel, purpose});
  }
});
