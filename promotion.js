/* eslint-disable require-jsdoc */
import http from "k6/http";
import { sleep } from "k6";

export const options = {
  // ext: {
  //   loadimpact: {
  //     projectID: 3620320,
  //     name: "reaction 1 promotion",
  //   }
  // },
  // stages: [
  //   { duration: "30s", target: 6 },
  //   { duration: "1m", target: 6 },
  //   { duration: "30s", target: 6 },
  // ],
};

const CreateCart = `mutation createCartMutation($input: CreateCartInput!) {
  createCart(input: $input) {
    cart {
      _id
    }
    token
  }
}`

const AddCartItems = `mutation addCartItemsMutation($input: AddCartItemsInput!) {
  addCartItems(input: $input) {
    cart {
      _id
      items {
        nodes {
          _id
        }
      }
    }
  }
}`

const UpdateCartItems = `mutation updateCartItemsQuantityMutation($input: UpdateCartItemsQuantityInput!) {
  updateCartItemsQuantity(input: $input) {
    cart {
      _id
      items {
        nodes {
          _id
        }
      }
    }
  }
}`

const QUERIES = { CreateCart, AddCartItems, UpdateCartItems };


const configs = {
  shopId: "cmVhY3Rpb24vc2hvcDpkU1pxZ1FzeXA0OEVwSnpvcg==",
  items: [
    {
      productId: "cmVhY3Rpb24vcHJvZHVjdDpzdzN3Z1BNWEdGV2NLTHo0aQ==",
      productVariantId: "cmVhY3Rpb24vcHJvZHVjdDptN253OW1SOFlFcUFoSjRZNQ==",
      price: 19.99,
    },
    {
      productId: "cmVhY3Rpb24vcHJvZHVjdDpZOVdTMlBnOEtRV3Z6Z1NmdA==",
      productVariantId: "cmVhY3Rpb24vcHJvZHVjdDpqWVJqQjVrck1Qd2VQNUh5Wg==",
      price: 19.99,
    }
  ]
}

function graphql(input) {
  const { query, variables, tag } = input;
  const url = `http://localhost:3000/graphql`;
  const res = http.post(
    url,
    JSON.stringify({ query, variables }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: tag }
    }
  );
  return res;
}

function createCart() {
  const { productId, productVariantId, price } = configs.items[0];
  const createCartResponse = graphql({
    query: QUERIES.CreateCart,
    variables: {
      input: {
        items: [
          {
            productConfiguration: {
              productId,
              productVariantId,
            },
            price: {
              amount: price,
              currencyCode: "USD",
            },
            quantity: 1,
          }
        ],
        shopId: configs.shopId,
      }
    },
    tag: "createCart",
  });

  return {
    id: createCartResponse.json().data.createCart.cart._id,
    token: createCartResponse.json().data.createCart.token,
  }
}

function addItemToCart(id, token) {
  const { productId, productVariantId, price } = configs.items[1];
  const response = graphql({
    query: QUERIES.AddCartItems,
    variables: {
      input: {
        items: [
          {
            productConfiguration: {
              productId,
              productVariantId,
            },
            price: {
              amount: price,
              currencyCode: "USD",
            },
            quantity: 1,
          }
        ],
        cartId: id,
        cartToken: token,
      }
    },
    tag: "addItemToCart",
  });
  const cartItemIds = response.json().data.addCartItems.cart.items.nodes.map(({ _id }) => _id);
  return cartItemIds;
}

function updateCartItemsQuantity(id, token, cartItemIds) {
  return graphql({
    query: QUERIES.UpdateCartItems,
    variables: {
      input: {
        items: cartItemIds.map((_id) => ({
          cartItemId: _id,
          quantity: 2,
        })),
        cartId: id,
        cartToken: token,
      }
    },
    tag: "updateCartItemsQuantity",
  });
}

export default function () {
  const { id, token } = createCart();
  const cartItemIds = addItemToCart(id, token);
  updateCartItemsQuantity(id, token, cartItemIds);
  sleep(1);
}
