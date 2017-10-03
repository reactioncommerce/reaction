import React from "react";
import PropTypes from "prop-types";
import { Reaction } from "/client/api";
import { Components } from "@reactioncommerce/reaction-components";

const LoginInline = (props) => {
  return (
    <div className="accounts-dialog accounts-inline">
      {Reaction.allowGuestCheckout() &&
        <div className="checkout-guest">
          <div className="guest-checkout">
            <p className="text-justify">
              <Components.Translation
                defaultValue="Continue as a guest, and you can create an account later."
                i18nKey="checkoutLogin.guestMessage"
              />
            </p>
            <Components.Button
              status="primary"
              buttonType="submit"
              bezelStyle="solid"
              className="btn-block login-button single-login-button continue-guest"
              i18nKeyLabel="checkoutLogin.continueAsGuest"
              label="Continue as Guest"
              onClick={props.continueAsGuest}
            />
          </div>
        </div>
      }
      <div className="checkout-login">
        <Components.Login
          loginFormCurrentView="loginFormSignUpView"
        />
      </div>
    </div>
  );
};

LoginInline.propTypes = {
  continueAsGuest: PropTypes.func
};


export default LoginInline;
