import { Reaction } from "/server/api";

export default function () {
  Reaction.registerTheme(Assets.getText("themes/navbar.css"));
}
