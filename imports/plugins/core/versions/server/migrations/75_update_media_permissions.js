import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";

Migrations.add({
  version: 75,
  async up() {
    const { Groups, Shops, users } = rawCollections;

    await Groups.updateMany({
      slug: "shop manager"
    }, {
      $addToSet: {
        permissions: {
          $each: [
            "media/create",
            "media/update",
            "media/delete"
          ]
        }
      }
    });

    // eslint-disable-next-line require-jsdoc
    async function setRoles(group) {
      await users.updateMany({
        [`roles.${group}`]: {
          $in: [
            "createProduct",
            "product/admin",
            "product/update"
          ]
        }
      }, {
        $addToSet: {
          [`roles.${group}`]: {
            $each: [
              "media/create",
              "media/update",
              "media/delete"
            ]
          }
        }
      });
    }

    await setRoles("__global_roles__");

    const shops = await Shops.find({}, {
      projection: {
        _id: 1
      }
    }).toArray();

    const promises = shops.map((shop) => setRoles(shop._id));
    await Promise.all(promises);
  },
  async down() {
    const { Groups, Shops, users } = rawCollections;

    await Groups.updateMany({
      slug: "shop manager"
    }, {
      $pull: {
        permissions: {
          $each: [
            "media/create",
            "media/update",
            "media/delete"
          ]
        }
      }
    });

    // eslint-disable-next-line require-jsdoc
    async function pullRoles(group) {
      await users.updateMany({
        [`roles.${group}`]: {
          $in: [
            "media/create",
            "media/update",
            "media/delete"
          ]
        }
      }, {
        $pull: {
          [`roles.${group}`]: {
            $each: [
              "media/create",
              "media/update",
              "media/delete"
            ]
          }
        }
      });
    }

    await pullRoles("__global_roles__");

    const shops = await Shops.find({}, {
      projection: {
        _id: 1
      }
    }).toArray();

    const promises = shops.map((shop) => pullRoles(shop._id));
    await Promise.all(promises);
  }
});
