import accounts from "./accounts";
import cart from "./cart";
import orders from "./orders";
import products from "./products";
import { examplePaymentMethod, examplePackage } from "./packages";
import shops from "./shops";
import users from "./users";
import groups from "./groups";

/**
 * @file Fixtures and Factories for testing - Use these factories to test shops, users, example payment methods, example packages, orders, products, accounts, carts and user groups.
 * See the [meteor-factory](https://github.com/versolearning/meteor-factory/) documentation to learn how to define, extend and create your own factories.
 *
 * @namespace Fixtures
*/

/**
 * @return {undefined}
 */
export default function fixtures() {
  shops();
  users();
  examplePaymentMethod();
  examplePackage();
  accounts();
  products();
  cart();
  orders();
  groups();
}
