import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts } from "/lib/collections";
import { Reaction } from "/server/api";

Meteor.methods({
  "keycloak/auth"(keycloakProfile) {
    check(keycloakProfile, Object);

    const id = Array.isArray(keycloakProfile.attributes) && keycloakProfile.attributes["reaction-meteor-id"][0];

    if (!id) {
      throw new Meteor.Error("access-denied", "User does not have reaction-meteor-id field");
    }

    let account = Accounts.findOne({ userId: id });

    if (!account) {
      const newAccount = {
        userId: id,
        shopId: Reaction.getShopId()
      };

      Accounts.insert(newAccount);
      account = Accounts.findOne({ userId: id });
    }

    this.setUserId(account.userId);

    return account.userId;
  }
});
