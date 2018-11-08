import Search from "@material-ui/icons/Search";

import { registerOperatorRoute } from "/imports/client/ui";

import "./settings/search.html";
import "./settings/search.js";

registerOperatorRoute({
  isNavigationLink: true,
  mainComponent: "searchSettings",
  path: "/search",
  sidebarIconComponent: Search,
  sidebarI18nLabel: "admin.dashboard.searchLabel"
});
