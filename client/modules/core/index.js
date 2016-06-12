import Core from "./main";
import * as Apps from "./helpers/apps";
import * as Globals from "./helpers/globals";
import * as Utils from "./helpers/utils";
import { Subscriptions } from "./subscriptions";

import { Router } from "/client/modules/router";
export const Reaction = Object.assign(
  Core,
  Apps,
  Globals,
  Utils,
  { Subscriptions },
  { Router }
);
