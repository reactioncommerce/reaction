import appEvents from "/imports/node-app/core/util/appEvents";
import sendSMTPEmail from "./util/sendSMTPEmail";

appEvents.on("sendEmail", sendSMTPEmail);
