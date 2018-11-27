import Factory from "/imports/test-utils/helpers/factory";
import mockContext from "/imports/test-utils/helpers/mockContext";
import setShippingAddressOnCart from "./setShippingAddressOnCart";

jest.mock("../util/getCartById", () => jest.fn().mockImplementation(() => Promise.resolve({
  _id: "cartId",
  shipping: [{
    _id: "group1",
    itemIds: ["123"],
    type: "shipping"
  }]
})));

const address = Factory.Address.makeOne({ _id: undefined });

test("expect to return a cart that has address added to all shipping fulfillment groups", async () => {
  const result = await setShippingAddressOnCart(mockContext, {
    address,
    cartId: "cartId"
  });
  expect(result).toEqual({
    cart: {
      _id: "cartId",
      shipping: [{
        _id: "group1",
        address: {
          ...address,
          _id: jasmine.any(String)
        },
        itemIds: ["123"],
        type: "shipping"
      }],
      updatedAt: jasmine.any(Date)
    }
  });
});

const addressId = "ADDRESS_ID";

test("if addressId is provided, sets the address._id to that", async () => {
  const result = await setShippingAddressOnCart(mockContext, {
    address,
    addressId,
    cartId: "cartId"
  });
  expect(result).toEqual({
    cart: {
      _id: "cartId",
      shipping: [{
        _id: "group1",
        address: {
          ...address,
          _id: addressId
        },
        itemIds: ["123"],
        type: "shipping"
      }],
      updatedAt: jasmine.any(Date)
    }
  });
});
