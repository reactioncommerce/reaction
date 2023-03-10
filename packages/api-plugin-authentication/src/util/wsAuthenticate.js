/* eslint-disable no-unused-vars */
import getUserFromAuthToken from "./getUserFromAuthToken.js";

/**
 * @summary Authenticate the Ws server if there is an Authorization param
 * @param {Object} ctx - The Ws server context
 * @param {Object} msg - The Ws server msg
 * @param {Object} args - The Ws server args
 * @return {Object} The context object with the user and userId
 */
export default async function wsAuthenticate(ctx, msg, args) {
  const context = {};
  const { connectionParams } = ctx;
  if (!connectionParams.Authorization) return context;

  const user = await getUserFromAuthToken(connectionParams.Authorization);
  if (user) {
    context.user = user;
    context.userId = user._id;
  }

  return context;
}
