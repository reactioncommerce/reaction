import React from "react";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import CheckboxCheckedIcon from "mdi-material-ui/CheckBoxOutline";

/**
 * @name TagTableSelect
 * @method
 * @summary Tag table select component, compatible with react table
 * @param {Object} props Props
 * @returns {Node} React component
 */
export default function TagTableSelect(props) {
  return (
    <Checkbox
      checked={props.checked}
      checkedIcon={<CheckboxCheckedIcon />}
      onClick={(event) => {
        const { shiftKey } = event;
        event.stopPropagation();
        props.onClick(props.id, shiftKey, props.row);
      }}
      onChange={() => { }}
    />
  );
}

TagTableSelect.propTypes = {
  // Checked prop is required to be named as such for React table compatibility
  // eslint-disable-next-line react/boolean-prop-naming
  checked: PropTypes.bool,
  id: PropTypes.string,
  onClick: PropTypes.func,
  row: PropTypes.object
};
