import Core from "./main";
import * as Apps from "./helpers/apps";
import * as Globals from "./helpers/globals";
import { Subscriptions } from "./subscriptions";

export const Reaction = Object.assign(
  Core,
  Apps,
  Globals
);

Reaction.Subscriptions = Subscriptions;
