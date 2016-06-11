import Core from "./main";
import * as Apps from "./helpers/apps";
import * as Globals from "./helpers/globals";
import * as Utils from "./helpers/utils";
import { Subscriptions } from "./subscriptions";

export const Reaction = Object.assign(
  Core,
  Apps,
  Globals,
  Utils,
  { Subscriptions }
);
