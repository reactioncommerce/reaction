import Search from "@material-ui/icons/Search";

import { registerOperatorRoute } from "/imports/client/ui";

import "./settings/search.html";
import "./settings/search.js";

registerOperatorRoute({
  path: "/search",
  mainComponent: "searchSettings",
  sidebarIconComponent: Search,
  sidebarI18nLabel: "admin.dashboard.searchLabel"
});
