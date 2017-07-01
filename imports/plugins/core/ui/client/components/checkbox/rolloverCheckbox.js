import React, { PropTypes } from "react";
import Checkbox from "./checkbox";

const RolloverCheckbox = ({ children, checked, checkboxClassName, onChange }) => {
  if (checked) {
    return (
      <div className="rollover-checkbox">
        <div className="selected-checkbox">
          <Checkbox
            checked={checked}
            onChange={onChange}
            className={checkboxClassName}
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
            />
        </div>
    </div>
  );
};

RolloverCheckbox.propTypes = {
  checkboxClassName: PropTypes.string,
  checked: PropTypes.bool,
  children: PropTypes.node,
  onChange: PropTypes.func
};

export default RolloverCheckbox;
