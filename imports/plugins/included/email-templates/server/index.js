import { Reaction } from "/server/api";
import StandardTemplate from "../lib/templates/standard";

Reaction.registerTemplate({
  title: "Standard Email",
  name: "standard-email",
  type: "email",
  template: StandardTemplate
});
