import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

const RolloverCheckbox = ({ children, checked, checkboxClassName, onChange, name, className }) => {
  const extendedClassName = classnames({
    "rollover-checkbox": true
  }, className);

  if (checked) {
    return (
      <div className={extendedClassName}>
        <div className="selected-checkbox">
          <Components.Checkbox
            checked={checked}
            onChange={onChange}
            className={checkboxClassName}
            name={name}
          />
        </div>
      </div>
    );
  }
  return (
    <div className={extendedClassName}>
      <div className="first-child">
        { children }
      </div>
      <div className="second-child">
        <Components.Checkbox
          checked={checked}
          onChange={onChange}
          className={checkboxClassName}
          name={name}
        />
      </div>
    </div>
  );
};

RolloverCheckbox.propTypes = {
  checkboxClassName: PropTypes.string,
  checked: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func
};

registerComponent("RolloverCheckbox", RolloverCheckbox);

export default RolloverCheckbox;
