import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { registerOperatorRoute } from "/imports/client/ui";
import { faTag } from "@fortawesome/free-solid-svg-icons";

export { default as DataTable } from "./components/TagDataTable";
export { default as TagDataTableColumn } from "./components/TagDataTableColumn";

import TagFormPage from "./pages/TagFormPageWithData";
import TagSettingsPage from "./pages/TagSettingsPageWithData";

registerOperatorRoute({
  isNavigationLink: false,
  isSetting: true,
  path: "/tags/create",
  mainComponent: TagFormPage
});

registerOperatorRoute({
  isNavigationLink: false,
  isSetting: true,
  path: "/tags/edit/:tagId",
  mainComponent: TagFormPage
});

registerOperatorRoute({
  isNavigationLink: true,
  isSetting: true,
  path: "/tags",
  mainComponent: TagSettingsPage,
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faTag} {...props} />,
  sidebarI18nLabel: "admin.tags.tags"
});
