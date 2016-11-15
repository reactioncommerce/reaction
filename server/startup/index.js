import Accounts from "./accounts";
import i18n from "./i18n";
import Load from "./load-data";
import Packages from "./packages";
import Registry from "./registry";
import Init from "./init";
import { Templates } from "/server/api/core/templates";


export default function () {
  Accounts();
  i18n();
  Templates();
  Load();
  Packages();
  Registry();
  Init();
}
