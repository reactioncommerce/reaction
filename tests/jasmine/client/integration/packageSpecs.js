import { Packages } from "/lib/collections";

/**
 * Packages integration specs
 *
 */
describe("Packages", function () {
  beforeAll(function () {
    VelocityHelpers.exportGlobals();
    Packages = Packages.find().fetch();
  });

  it("should have enabled core", function () {
    expect(Packages.length).toBeGreaterThan("1");
    let corePackage = _.findWhere(Packages, {
      name: "core"
    });
    expect(corePackage.enabled).toEqual(true);
  });

  it("should have enabled accounts", function () {
    expect(Packages.length).toBeGreaterThan("1");
    let corePackage = _.findWhere(Packages, {
      name: "reaction-accounts"
    });
    expect(corePackage.enabled).toEqual(true);
  });
});
