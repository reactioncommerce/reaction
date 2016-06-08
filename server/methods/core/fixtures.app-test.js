import { Factory } from "meteor/dburles:factory";
import Fixtures from "/server/imports/fixtures";
Fixtures();

import "/server/imports/fixtures/shops";
import { getShop } from "/server/imports/fixtures/shops";
import { expect } from "meteor/practicalmeteor:chai";


describe("getShop", function () {
  it("should return a new shop", function () {
    let shop = getShop();
    expect(shop).to.not.be.undefined;
  });
});
