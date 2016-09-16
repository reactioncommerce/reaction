import _ from "lodash";
import { Products } from "/lib/collections";

export default function () {
  /**
   * Reaction Collection Hooks
   * transform collections based on events
   *
   * See: https://github.com/matb33/meteor-collection-hooks
   */

  /**
   * before product update
   */
  // TODO: review this.  not sure this does what it was intended to
  Products.before.update((userId, product, fieldNames, modifier) => {
    // handling product positions updates
    if (_.indexOf(fieldNames, "positions") !== -1) {
      if (modifier.$addToSet) {
        if (modifier.$addToSet.positions) {
          createdAt = new Date();
          updatedAt = new Date();
          if (modifier.$addToSet.positions.$each) {
            for (position in modifier.$addToSet.positions.$each) {
              if ({}.hasOwnProperty.call(modifier.$addToSet.positions.$each,
                  position)) {
                createdAt = new Date();
                updatedAt = new Date();
              }
            }
          } else {
            modifier.$addToSet.positions.updatedAt = updatedAt;
          }
        }
      }
    }
  });
}
