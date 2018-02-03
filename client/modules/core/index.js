import Core from "./main";
import * as Apps from "./helpers/apps";
import * as Globals from "./helpers/globals";
import * as Utils from "./helpers/utils";
import { Subscriptions } from "./subscriptions";

import Log from "/client/modules/logger";
import { DOM } from "/imports/plugins/core/dom/client";
import { Router } from "/client/modules/router";

import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";


export const Reaction = Object.assign(
  Core,
  Apps,
  Globals,
  Utils,
  { Subscriptions },
  { Log },
  { DOM },
  { Router },
  { Collections },
  { Schemas }
);
