import React from "react";
import PropTypes from "prop-types";
import ProductList from "../components/ProductList";

/**
 * Variant and Option list component
 * @summary A list component for variant and option depending on passed in props
 * @param {Object} props Component props
 * @return {Node} React node
 */
function VariantList(props) {
  const {
    option,
    options,
    product,
    variant,
    variants,
    onCreateOption,
    onCreateVariant
  } = props;

  return (
    <ProductList
      items={option ? options : variants}
      onCreate={() => { option ? onCreateOption(variant) : onCreateVariant(product); }}
      selectedVariantId={(option && option._id) || (variant && variant._id)}
      title={option ? "Options" : "Variants"}
    />
  );
}

VariantList.propTypes = {
  onCreateOption: PropTypes.func,
  onCreateVariant: PropTypes.func,
  option: PropTypes.object,
  options: PropTypes.arrayOf(PropTypes.object),
  product: PropTypes.object,
  variant: PropTypes.object,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default VariantList;
