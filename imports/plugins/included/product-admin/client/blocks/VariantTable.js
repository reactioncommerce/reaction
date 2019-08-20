import React from "react";
import PropTypes from "prop-types";
import VariantTableComponent from "../components/VariantTable";

/**
 * Variant table block component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function VariantTable(props) {
  const {
    onProductVariantFieldSave,
    onCreateVariant,
    product
  } = props;

  return (
    <VariantTableComponent
      title="Variants"
      items={props.variants}
      onCreate={() => { onCreateVariant(product); }}
      onChangeField={(item, field, value) => {
        onProductVariantFieldSave(item._id, field, value);
      }}
    />
  );
}

VariantTable.propTypes = {
  onCreateVariant: PropTypes.func,
  onProductVariantFieldSave: PropTypes.func,
  product: PropTypes.object,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default VariantTable;
