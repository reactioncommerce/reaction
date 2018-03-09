import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";


Migrations.add({
  version: 22,
  up() {
    const pkg = Packages.findOne({ name: "reaction-accounts" });
    for (const route of pkg.registry) {
      if (route.route === "/account/profile/verify:email?") {
        route.route = "/account/profile/verify";
        route.template = "VerifyAccount";
        Packages.update(
          { _id: pkg._id },
          { $set: { registry: pkg.registry } }
        );
        break;
      }
    }
  },
  down() {
    const pkg = Packages.findOne({ name: "reaction-accounts" });
    for (const route of pkg.registry) {
      if (route.route === "/account/profile/verify") {
        route.route = "/account/profile/verify:email?";
        route.template = "verifyAccount";
        Packages.update(
          { _id: pkg._id },
          { $set: { registry: pkg.registry } }
        );
        break;
      }
    }
  }
});
