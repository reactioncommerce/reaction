import Accounts from "./accounts";
import i18n from "./i18n";
import Jobs from "./jobs";
import Load from "./load-data";
import Locale from "./locale";
import Packages from "./packages";
import Registry from "./registry";
import Init from "./init";

export default function () {
  Accounts();
  i18n();
  Jobs();
  Load();
  Locale();
  Packages();
  Registry();
  Init();
}
