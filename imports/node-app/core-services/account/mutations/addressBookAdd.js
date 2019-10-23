import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name accounts/addressBookAdd
 * @memberof Mutations/Accounts
 * @method
 * @summary Add a new address to an account
 * @param {Object} context - GraphQL execution context
 * @param {Object} address - address
 * @param {String} [accountUserId] - `account.userId` used by admin to edit users
 * @returns {Promise<Object>} with updated address
 */
export default async function addressBookAdd(context, address, accountUserId) {
  const { appEvents, collections, userHasPermission, userId: userIdFromContext } = context;
  const { Accounts } = collections;

  const userId = accountUserId || userIdFromContext;
  const account = await Accounts.findOne({ userId });

  if (!account) throw new ReactionError("not-found", "No account found");

  // Security check for admin access
  if (typeof accountUserId === "string" && userIdFromContext !== accountUserId) {
    if (!userHasPermission(["reaction-accounts"], account.shopId)) throw new ReactionError("access-denied", "Access denied");
  }

  // required default ID
  if (!address._id) address._id = Random.id();

  // if address got shipment or billing default, we need to update cart
  // addresses accordingly
  if (address.isShippingDefault || address.isBillingDefault) {
    // then change the address that has been affected
    if (address.isShippingDefault) {
      await Accounts.updateOne({
        userId,
        "profile.addressBook.isShippingDefault": true
      }, {
        $set: {
          "profile.addressBook.$.isShippingDefault": false
        }
      });
    }

    if (address.isBillingDefault) {
      await Accounts.updateOne({
        userId,
        "profile.addressBook.isBillingDefault": true
      }, {
        $set: {
          "profile.addressBook.$.isBillingDefault": false
        }
      });
    }
  }

  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    { userId },
    {
      $addToSet: {
        "profile.addressBook": address
      },
      $set: {
        updatedAt: new Date()
      }
    },
    {
      returnOriginal: false
    }
  );

  if (!updatedAccount) {
    throw new ReactionError("server-error", "Unable to add address to account");
  }

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userIdFromContext,
    updatedFields: ["profile.addressBook"]
  });

  // If the address update was successful, then return the full updated address.
  // Since we just pushed into `profile.addressBook`, we know it will exist.
  return updatedAccount.profile.addressBook.find((updatedAddress) => address._id === updatedAddress._id);
}
