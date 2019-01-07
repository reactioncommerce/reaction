import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { registerOperatorRoute } from "/imports/client/ui";
import { faTag } from "@fortawesome/free-solid-svg-icons";

export { default as DataTable } from "./components/TagDataTable";
export { default as TagDataTableColumn } from "./components/TagDataTableColumn";
export { default as TagSettings } from "./containers/TagSettings";

import TagFormPage from "./pages/TagFormPageWithData";

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
  mainComponent: "TagSettings",
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <FontAwesomeIcon icon={faTag} {...props} />,
  sidebarI18nLabel: "admin.tags.tags"
});
