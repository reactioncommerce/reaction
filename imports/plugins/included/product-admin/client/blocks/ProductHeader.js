import React from "react";
import PropTypes from "prop-types";
import ProductHeaderComponent from "../components/ProductHeader";

/**
 * Product header block component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function ProductHeader(props) {
  const {
    onArchiveProduct,
    onCloneProduct,
    onToggleProductVisibility,
    product
  } = props;

  return (
    <ProductHeaderComponent
      product={product}
      onArchiveProduct={onArchiveProduct}
      onCloneProduct={onCloneProduct}
      onVisibilityChange={onToggleProductVisibility}
    />
  );
}

ProductHeader.propTypes = {
  onArchiveProduct: PropTypes.func,
  onCloneProduct: PropTypes.func,
  onToggleProductVisibility: PropTypes.func,
  product: PropTypes.object,
  restoreProduct: PropTypes.func
};

export default ProductHeader;
