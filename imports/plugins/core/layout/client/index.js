import "./templates/layout/admin/admin.html";
import "./templates/layout/admin/admin.js";
import "./templates/layout/alerts/alerts.html";
import "./templates/layout/alerts/alerts.js";
import "./templates/layout/alerts/inlineAlerts.js";
import "./templates/layout/alerts/reactionAlerts.js";
import "./templates/layout/createContentMenu/createContentMenu.html";
import "./templates/layout/createContentMenu/createContentMenu.js";
import "./templates/layout/footer/footer.html";
import "./templates/layout/header/brand.html";
import "./templates/layout/header/button.html";
import "./templates/layout/header/header.html";
import "./templates/layout/header/header.js";
import "./templates/layout/header/tags.html";
import "./templates/layout/notFound/notFound.html";
import "./templates/layout/notFound/notFound.js";
import "./templates/layout/notice/unauthorized.html";
import "./templates/layout/notice/unauthorized.js";
import "./templates/layout/layout.html";

import "./templates/theme/theme.html";
import "./templates/theme/theme.js";


import CoreLayout from "./components/coreLayout";
import PrintLayout from "./components/printLayout";
import { registerComponent } from "../lib/components";


registerComponent({
  name: "coreLayout", // lowercased to match the legacy blaze "coreLayout"
  component: CoreLayout
});


registerComponent({
  name: "printLayout", // lowercased to match the legacy blaze "printLayout"
  component: PrintLayout
});
