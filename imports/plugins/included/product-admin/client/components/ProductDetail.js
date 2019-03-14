import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import Grid from "@material-ui/core/Grid";
import withProduct from "../hocs/withProduct";
import ProductList from "./ProductList";
import ProductAdminForm from "./productAdmin";
import ProductHeader from "./ProductHeader";
import VariantTable from "./VariantTable";

/**
 * ProductDetail component
 * @param {Object} props Component props
 * @return {Node} React node
 */
function ProductDetail(props) {
  const {
    onArchiveProduct,
    onCloneProduct,
    onProductVariantFieldSave,
    onToggleProductVisibility,
    onCreateVariant,
    product
  } = props;

  return (
    <Fragment>
      <Components.ProductPublish />
      <Grid container spacing={24}>
        <Grid item sm={12}>
          <ProductHeader
            product={product}
            onArchiveProduct={onArchiveProduct}
            onCloneProduct={onCloneProduct}
            onVisibilityChange={onToggleProductVisibility}
          />
        </Grid>
        <Grid item sm={4}>
          <ProductList
            items={props.variants}
            onCreate={() => onCreateVariant(product)}
            title="Variants"
          />
        </Grid>
        <Grid item sm={8}>
          <ProductAdminForm {...props} />
          <VariantTable
            title="Variants"
            items={props.variants}
            onCreate={() => { onCreateVariant(product); }}
            onChangeField={(item, field, value) => {
              onProductVariantFieldSave(item._id, field, value);
            }}
          />
        </Grid>
      </Grid>
    </Fragment>
  );
}

ProductDetail.propTypes = {
  cloneProduct: PropTypes.func,
  onArchiveProduct: PropTypes.func,
  onCloneProduct: PropTypes.func,
  onCreateVariant: PropTypes.func,
  onProductVariantFieldSave: PropTypes.func,
  onToggleProductVisibility: PropTypes.func,
  product: PropTypes.object,
  removeProduct: PropTypes.func,
  restoreProduct: PropTypes.func,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default withProduct(ProductDetail);
