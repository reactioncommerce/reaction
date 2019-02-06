import appEvents from "/imports/node-app/core/util/appEvents";
import sendVerificationEmail from "./util/sendVerificationEmail";

appEvents.on("afterAddUnverifiedEmailToUser", ({ email, userId }) => {
  sendVerificationEmail(userId, email);
});
