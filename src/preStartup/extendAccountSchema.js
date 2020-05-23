/**
 * @summary Called before startup to extend the Account schema
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function extendAccountSchema(context) {
  context.simpleSchemas.Account.extend({
    "adminUIShopIds": {
      type: Array,
      optional: true,
      defaultValue: []
    },
    "adminUIShopIds.$": {
      type: String
    }
  });
}
