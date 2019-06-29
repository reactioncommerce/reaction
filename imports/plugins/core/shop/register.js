import Reaction from "/imports/plugins/core/core/server/Reaction";
import register from "./server/register";

Reaction.whenAppInstanceReady(register);
