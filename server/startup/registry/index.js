import Accounts from "./accounts";
import Catalog from "./catalog";
import Core from "./core";
import Email from "./email";
import i18n from "./i18n";
import Router from "./router";

export default function () {
  Accounts();
  Catalog();
  Core();
  Email();
  i18n();
  Router();
}
