import React from "react";
import PropTypes from "prop-types";
import Checkbox from "./checkbox";

const RolloverCheckbox = ({ children, checked, checkboxClassName, onChange, name }) => {
  if (checked) {
    return (
      <div className="rollover-checkbox">
        <div className="selected-checkbox">
          <Checkbox
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
    <div className="rollover-checkbox">
      <div className="first-child">
        { children }
      </div>
      <div className="second-child">
        <Checkbox
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
  name: PropTypes.string,
  onChange: PropTypes.func
};

export default RolloverCheckbox;
