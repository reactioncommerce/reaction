import React from "react";
import PropTypes from "prop-types";
import VariantTable from "../components/VariantTable";

/**
 * Variant Option table block component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function OptionTable(props) {
  const {
    onProductVariantFieldSave,
    onCreateOption,
    childVariants,
    isAtMaxDepth
  } = props;

  if (isAtMaxDepth) return null;

  return (
    <VariantTable
      title="Options"
      items={childVariants}
      onCreate={onCreateOption}
      onChangeField={(item, field, value) => {
        onProductVariantFieldSave(item._id, field, value);
      }}
    />
  );
}

OptionTable.propTypes = {
  childVariants: PropTypes.array,
  isAtMaxDepth: PropTypes.bool,
  onCreateOption: PropTypes.func,
  onProductVariantFieldSave: PropTypes.func
};

export default OptionTable;
