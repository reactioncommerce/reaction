import React from "react";
import PropType from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import classnames from "classnames";

const VerifyAccount = ({ error }) => {
  const classNames = classnames({
    "fa": true,
    "fa-times-circle-o": !!error,
    "fa-check-circle-o": !error
  });

  const style = {
    color: error ? "#f33" : "#49da49",
    fontSize: "8rem"
  };

  return (
    <div className="container-fluid-sm">
      <div className="rui empty-view-message">
        <i className={classNames} style={style}/>
        <p className="message">
          <Components.Translation
            defaultValue={error ? error.reason : "Email verified"}
            i18nKey={error ? error.i18nKey : "accountsUI.info.emailVerified"}
          />
        </p>
      </div>
    </div>
  );
};

VerifyAccount.propTypes = {
  error: PropType.object
};

export default VerifyAccount;
