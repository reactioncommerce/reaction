import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";

Migrations.add({
  version: 76,
  async up() {
    const { Accounts, users } = rawCollections;

    // Delete anonymous users and accounts
    const anonymousUsersCursor = users.find({
      emails: { $size: 0 }
    }, {
      projection: {
        _id: 1
      }
    });

    /* eslint-disable no-await-in-loop */
    let user = await anonymousUsersCursor.next();
    while (user) {
      await users.deleteOne({ _id: user._id });
      await Accounts.deleteOne({ userId: user._id });

      user = await anonymousUsersCursor.next();
    }
    /* eslint-enable no-await-in-loop */
  }
  // No `down` migration possible. Deleted users would need to be restored from backup.
});
