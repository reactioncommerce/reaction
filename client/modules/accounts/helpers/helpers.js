import { Template } from "meteor/templating";
import {
  SignUpContainer,
  ForgotContainer
} from "../containers";

export const LoginFormSharedHelpers = {
  signUpComponent() {
    return SignUpContainer;
  },

  forgotComponent() {
    return ForgotContainer;
  },

  hasPasswordService() {
    return !!Package["accounts-password"];
  }
};
