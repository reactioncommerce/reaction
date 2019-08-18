import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import PlusIcon from "mdi-material-ui/Plus";
import { Reaction } from "/client/api";

/**
 * Get url for product, variant or option
 * @param {Object} item Product, variant or option
 * @returns {String} URL
 */
function getURL(item) {
  // Top level product
  if (item.type === "simple") {
    return `/operator/products/${item._id}`;
  }

  // Variant
  if (item.ancestors.length === 1) {
    return `/operator/products/${item.ancestors[0]}/${item._id}`;
  }

  // Option
  return `/operator/products/${item.ancestors[0]}/${item.ancestors[1]}/${item._id}`;
}

/**
 * Get the secondary label for the product item
 * @param {Object} item A product, variant or option
 * @returns {String} A text label with status and price
 */
function getItemSecondaryLabel({ isVisible, displayPrice }) {
  const visibility = isVisible ? "Visible" : "Hidden";

  return `${visibility} - ${displayPrice}`;
}

/**
 * Product list
 * @param {Object} props Component props
 * @returns {Node} Component representing a list of products, variants, or options
 */
function ProductList({ items, title, onCreate, selectedVariantId }) {
  if (!Array.isArray(items)) {
    return null;
  }

  const hasCreateProductPermission = Reaction.hasPermission(["createProduct", "product/admin", "product/create"], Reaction.getUserId(), Reaction.getShopId());

  return (
    <Card>
      {hasCreateProductPermission ?
        <CardHeader
          action={
            <IconButton onClick={onCreate}>
              <PlusIcon />
            </IconButton>
          }
          title={title}
        />
        :
        <CardHeader
          title={title}
        />
      }
      <List dense>
        {items.map((item) => (
          <Link key={item._id} to={getURL(item)}>
            <ListItem button selected={item._id === selectedVariantId}>
              {(Array.isArray(item.media) && item.media.length &&
                <img
                  alt=""
                  src={item.media[0].url({ store: "thumbnail" })}
                  width={36}
                />
              ) || ""}
              <ListItemText
                primary={item.optionTitle || item.title || "Untitled"}
                secondary={getItemSecondaryLabel(item)}
              />
            </ListItem>
          </Link>
        ))}
      </List>
    </Card>
  );
}

ProductList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  onCreate: PropTypes.func,
  selectedVariantId: PropTypes.string,
  title: PropTypes.string
};

export default ProductList;
