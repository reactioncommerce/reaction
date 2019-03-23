import React from "react";
import PropTypes from "prop-types";
import VariantTable from "../components/VariantTable";

/**
 * Variant Option table block component
 * @param {Object} props Component props
 * @return {Node} React node
 */
function OptionTable(props) {
  const {
    onProductVariantFieldSave,
    onCreateVariant,
    options,
    variant
  } = props;

  return (
    <VariantTable
      title="Options"
      items={options}
      onCreate={() => { onCreateVariant(variant); }}
      onChangeField={(item, field, value) => {
        onProductVariantFieldSave(item._id, field, value);
      }}
    />
  );
}

OptionTable.propTypes = {
  onCreateVariant: PropTypes.func,
  onProductVariantFieldSave: PropTypes.func,
  options: PropTypes.object,
  variant: PropTypes.object
};

export default OptionTable;
