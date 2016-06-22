import Accounts from "./accounts";
import Analytics from "./analytics";
import Catalog from "./catalog";
import Checkout from "./checkout";
import Core from "./core";
import Dashboard from "./dashboard";
import Email from "./email";
import i18n from "./i18n";
import Inventory from "./inventory";
import Layout from "./layout";
import Orders from "./orders";
import ProductVariant from "./product-variant";
import Router from "./router";
import Shipping from "./shipping";
import Social from "./social";
import UINavbar from "./ui-navbar";
import UI from "./ui";


export default function () {
  Accounts();
  Analytics();
  Catalog();
  Checkout();
  Core();
  Dashboard();
  Email();
  i18n();
  Inventory();
  Layout();
  Orders();
  ProductVariant();
  Router();
  Shipping();
  Social();
  UINavbar();
  UI();
}
