import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Accounts } from "/lib/collections";
import { Reaction } from "/server/api";

Meteor.methods({
  "keycloak/auth"(keycloakProfile) {
    check(keycloakProfile, Object);

    const id = keycloakProfile.attributes["reaction-meteor-id"][0];

    // debugging logs
    console.log(JSON.stringify({ keycloakProfile }, null, 4));
    console.log({ id });
    //

    let account = Accounts.findOne({ userId: id });

    if (!account) {
      const newAccount = {
        userId: id,
        shopId: Reaction.getShopId()
      };

      Accounts.insert(newAccount);
      account = Accounts.findOne({ userId: id });
    }

    this.setUserId(account._id);

    return account._id;
  }
});
