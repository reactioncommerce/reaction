import Accounts from "./accounts";
import Core from "./core";
import i18n from "./i18n";
import Router from "./router";

export default function () {
  Accounts();
  Core();
  i18n();
  Router();
}
