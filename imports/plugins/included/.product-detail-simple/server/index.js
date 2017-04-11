import { Reaction } from "/server/api";
import SimpleLayout from "../lib/layout/simple";
import TwoColumnLayout from "../lib/layout/twoColumn";
import "./i18n";

Reaction.registerTemplate({
  name: "productDetailSimple",
  title: "Product Detail Simple Layout",
  type: "react",
  templateFor: ["pdp"],
  permissions: ["admin", "owner"],
  audience: ["anonymous", "guest"],
  template: SimpleLayout()
});

Reaction.registerTemplate({
  name: "productDetailTwoColumn",
  title: "Product Detail Two Column Layout",
  type: "react",
  templateFor: ["pdp"],
  permissions: ["admin", "owner"],
  audience: ["anonymous", "guest"],
  template: TwoColumnLayout()
});
