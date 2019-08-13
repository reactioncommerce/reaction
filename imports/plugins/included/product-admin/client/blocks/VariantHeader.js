import React from "react";
import PropTypes from "prop-types";
import ProductHeader from "../components/ProductHeader";

/**
 * Variant table block component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function VariantHeader(props) {
  const {
    parentVariant,
    product,
    variant,
    removeVariant,
    restoreVariant,
    cloneVariant,
    onVisibilityButtonClick
  } = props;

  return (
    <ProductHeader
      product={product}
      parentVariant={parentVariant}
      variant={variant}
      onCloneVariant={cloneVariant}
      onArchiveProduct={removeVariant}
      onRestoreProduct={restoreVariant}
      onVisibilityChange={onVisibilityButtonClick}
    />
  );
}

VariantHeader.propTypes = {
  cloneVariant: PropTypes.func,
  onVisibilityButtonClick: PropTypes.func,
  option: PropTypes.object,
  parentVariant: PropTypes.object,
  product: PropTypes.object,
  removeVariant: PropTypes.func,
  restoreVariant: PropTypes.func,
  variant: PropTypes.object
};

export default VariantHeader;
