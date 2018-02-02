import { Reaction } from "/client/api";

/**
 * @file Various helper methods
 *
 * @namespace Helpers
 */

/**
 * @name importMoment
 * @method
 * @memberof Helpers
 * @return {Object} returns moment with async / await
 */
export async function importMoment() {
  const moment = await import("moment");
  moment.locale(Reaction.Locale.get().language); // set moment locale when moment is loaded
  return moment;
}
