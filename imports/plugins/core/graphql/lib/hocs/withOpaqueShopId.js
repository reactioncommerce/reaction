import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import Logger from "/client/modules/logger";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";

const composer = (props, onData) => {
  const shopId = Reaction.getShopId();

  getOpaqueIds([{ namespace: "Shop", id: shopId }])
    .then(([opaqueShopId]) => {
      onData(null, {
        shopId: opaqueShopId
      });
      return null;
    })
    .catch((error) => {
      Logger.error(error);
    });
};

export default composeWithTracker(composer);
