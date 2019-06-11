import Reaction from "/imports/plugins/core/core/server/Reaction";
import register from "./server/no-meteor/register";

Reaction.whenAppInstanceReady(register);
