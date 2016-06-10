import { Factory } from "meteor/dburles:factory";
import { expect } from "meteor/practicalmeteor:chai";

import Fixtures from "/server/imports/fixtures";
Fixtures();

import { getShop, getAddress } from "/server/imports/fixtures/shops";
import { getUser } from "/server/imports/fixtures/accounts";
import { metaField, productVariant, addProduct } from "/server/imports/fixtures/products";
import { getCartItem } from "/server/imports/fixtures/cart";

describe("Shops Fixture", function () {
  it("getShop should return a new shop", function () {
    let shop = getShop();
    expect(shop).to.not.be.undefined;
  });

  it("fakerAddress should return an address", function () {
    let fakeAddress = getAddress();
    expect(fakeAddress).to.not.be.undefined;
  });
});

describe("Carts Fixture", function () {
  it("Cart factory should create cart", function () {
    let cart = Factory.create("cart");
    expect(cart).to.not.be.undefined;
  });

  it("Cart factory should create anonymous cart", function () {
    let anonymousCart = Factory.create("anonymousCart");
    expect(anonymousCart).to.not.be.undefined;
  });

  it("cartItem should return a cartItem", function () {
    let cartItem = getCartItem();
    expect(cartItem).to.not.be.undefined;
  });
});

describe("Accounts Fixture", function () {
  it("getUser should return a user", function () {
    let user = getUser();
    expect(user).to.not.be.undefined;
  });
});

describe("Product Fixture", function () {
  it("metafield should return a metafield", function () {
    let metafield = metaField();
    expect(metafield).to.not.be.undefined;
  });

  it("productVariant should return a productVariant", function () {
    let _productVariant = productVariant();
    expect(_productVariant).to.not.be.undefined;
  });

  it("addProduct should add a product", function () {
    let addedProduct = addProduct();
    expect(addedProduct).to.not.be.undefined;
  });

  it("Product Factory should create a product", function () {
    let addedProduct = Factory.create("product");
    expect(addedProduct).to.not.be.undefined;
  });
});
