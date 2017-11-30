import accounts from "./accounts";
import cart from "./cart";
import orders from "./orders";
import products from "./products";
import { examplePaymentMethod, examplePackage } from "./packages";
// import shipping from "./shipping";
import shops from "./shops";
import users from "./users";
import groups from "./groups";

export default function () {
  shops();
  users();
  examplePaymentMethod();
  examplePackage();
  accounts();
  products();
  cart();
  orders();
  groups();
  // shipping();
}
