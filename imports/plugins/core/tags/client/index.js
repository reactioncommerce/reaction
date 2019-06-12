import React from "react";
import { registerOperatorRoute } from "/imports/client/ui";
import TagIcon from "mdi-material-ui/Tag";

export { default as DataTable } from "./components/TagDataTable";
export { default as TagDataTableColumn } from "./components/TagDataTableColumn";

import TagFormPage from "./pages/TagFormPageWithData";
import TagSettingsPage from "./pages/TagSettingsPageWithData";

registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/tags/create",
  mainComponent: TagFormPage
});

registerOperatorRoute({
  isNavigationLink: false,
  isSetting: false,
  path: "/tags/edit/:tagId",
  mainComponent: TagFormPage
});

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: false,
  path: "/tags",
  priority: 50,
  mainComponent: TagSettingsPage,
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <TagIcon {...props} />,
  sidebarI18nLabel: "admin.tags.tags"
});
