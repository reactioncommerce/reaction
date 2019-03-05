import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { i18next } from "/client/api";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const styles = (theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2
  }
});

/**
 * Header component for various product admin forms
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function ProductHeader(props) {
  const {
    classes,
    product,
    variant,
    onCloneVariant,
    onRemoveVariant,
    onRestoreVariant,
    onVisibilityChange,
    option
  } = props;

  if (!product) {
    return null;
  }

  const currentProduct = option || variant || product;

  // Delete button
  const deleteButton = (
    <Button onClick={() => onRemoveVariant(currentProduct)} size="small">
      {"Archive"}
    </Button>
  );

  if (currentProduct.isDeleted) {
    return (
      <Button onClick={() => onRestoreVariant(currentProduct)} size="small">
        {"Restore"}
      </Button>
    );
  }

  return (
    <div className={classes.root}>
      <div>
        <Link to="/operator/products">{"Products > "}</Link>
        <Link to={`/operator/products/${product._id}`}>{product.title}</Link>
        {variant && <Link to={`/operator/products/${product._id}/${variant._id}`}>{` > ${variant.title}`}</Link>}
        {option && <Link to={`/operator/products/${product._id}/${variant._id}/${option._id}`}>{` > ${option.title}`}</Link>}
      </div>
      <Typography variant="h2">
        {(option && option.title) || (variant && variant.title) || (product && product.title)} {product.isDeleted && `(${i18next.t("app.archived")})`}
      </Typography>
      <div>
        {deleteButton}
        <Button onClick={() => onCloneVariant(currentProduct)}>
          {"Duplicate"}
        </Button>
        <Button
          onClick={() => onVisibilityChange(currentProduct)}
        >
          {currentProduct.isVisible ? "Make Visible" : "Make Hidden"}
        </Button>
      </div>
    </div>
  );
}
ProductHeader.propTypes = {
  classes: PropTypes.object,
  onCloneVariant: PropTypes.func,
  onRemoveVariant: PropTypes.func,
  onRestoreVariant: PropTypes.func,
  onVisibilityChange: PropTypes.func,
  option: PropTypes.object,
  product: PropTypes.object,
  variant: PropTypes.object
};

export default withStyles(styles, { name: "RuiProductHeader" })(ProductHeader);
