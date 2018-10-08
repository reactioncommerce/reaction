import { paymentMethods } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

export default async function () {
  return Array.from(paymentMethods);
}
