import Accounts from "./accounts";
import i18n from "./i18n";
import Load from "./load-data";
import Packages from "./packages";
import Registry from "./registry";
import Init from "./init";
import { InitTemplates } from "/server/api/core/templates";


export default function () {
  Accounts();
  i18n();
  InitTemplates();
  Load();
  Packages();
  Registry();
  Init();
}
