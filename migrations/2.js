/**
 * @summary migrates the database down one version
 * @param {Object} args - the arguments
 * @param {Object} args.db - the DB client
 * @param {Function} args.progress - a function to set the progress of the operation
 * @returns {undefined}
 */
async function down({ db, progress }) {
  // remove the adminUIShopIds field on accounts where it exists
  await db.collection("Accounts").updateMany({
    adminUIShopIds: {
      $exists: true
    }
  }, {
    $unset: {
      adminUIShopIds: ""
    }
  });

  progress(100);
}

/**
 * @summary migrates the database up one version
 * @param {Object} args - the arguments
 * @param {Object} args.db - the DB client
 * @param {Function} args.progress - a function to set the progress of the operation
 * @returns {undefined}
 */
async function up({ db, progress }) {
  // get all accounts without adminUIShopIds assigned, with their corresponding Groups
  const accountsWithoutAdminUIShopIds = await db.collection("Accounts").aggregate([
    {
      $match: {
        adminUIShopIds: {
          $exists: false
        }
      }
    },
    {
      $lookup: {
        from: "Groups",
        localField: "groups",
        foreignField: "_id",
        as: "groups"
      }
    }
  ]).toArray();

  // iterate over accounts without adminUIShopIds assigned
  for (let index = 0; index < accountsWithoutAdminUIShopIds.length; index += 1) {
    const account = accountsWithoutAdminUIShopIds[index];

    if (account.groups && Array.isArray(account.groups)) {
      const adminUIShopIds = [];

      for (const group of account.groups) {
        // if owner of a particular shop, push that shop to our adminUIShopIds
        if (group.slug === "owner" && group.shopId !== null) {
          adminUIShopIds.push(group.shopId);
        }
      }

      // save the list of shopIds the account is an owner of as adminUIShopIds
      // eslint-disable-next-line no-await-in-loop
      await db.collection("Accounts").update({ _id: account._id }, {
        $set: {
          adminUIShopIds
        }
      });

      progress(Math.floor((((index + 1) / accountsWithoutAdminUIShopIds.length) / 2) * 100));
    }
  }

  progress(100);
}

export default {
  down,
  up
};
