import React from "react";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";
import Button from "./button.jsx";

const FlatButton = (props) => {
  const buttonClassName = classnames({
    rui: true,
    button: true
  });

  return (
    <Button
      className={buttonClassName}
      {...props}
    />
  );
};

FlatButton.propTypes = { ...Button.propTypes };
FlatButton.defaultProps = {
  bezelStyle: "flat"
};

registerComponent("FlatButton", FlatButton);

export default FlatButton;
