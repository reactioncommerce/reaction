import React from "react";
import PropTypes from "prop-types";
import ProductList from "../components/ProductList";

/**
 * Variant and Option list component
 * @summary A list component for variant and option depending on passed in props
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function VariantList(props) {
  const {
    parentVariant,
    product,
    variant,
    variants,
    onCreateOption,
    onCreateVariant

  } = props;

  return (
    <ProductList
      items={variants}
      onCreate={() => { parentVariant ? onCreateOption(parentVariant) : onCreateVariant(product); }}
      selectedVariantId={variant && variant._id}
      title={parentVariant ? "Options" : "Variants"}
    />
  );
}

VariantList.propTypes = {
  onCreateOption: PropTypes.func,
  onCreateVariant: PropTypes.func,
  option: PropTypes.object,
  options: PropTypes.arrayOf(PropTypes.object),
  parentVariant: PropTypes.object,
  product: PropTypes.object,
  variant: PropTypes.object,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default VariantList;
