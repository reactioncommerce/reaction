import accounts from "./accounts";
import cart from "./cart";
import orders from "./orders";
import products from "./products";
import examplePaymentMethod from "./packages";
// import shipping from "./shipping";
import shops from "./shops";
import users from "./users";

export default function () {
  shops();
  users();
  examplePaymentMethod();
  accounts();
  products();
  cart();
  orders();
  // shipping();
}
