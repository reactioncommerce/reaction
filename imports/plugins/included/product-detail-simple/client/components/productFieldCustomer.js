import React, { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

class ProductFieldCustomer extends Component {
  render() {
    const { element, fieldName, itemProp, product } = this.props;
    const classNames = classnames({
      pdp: true,
      field: true,
      [fieldName]: !!fieldName
    });

    if (element) {
      return React.createElement(element, {
        className: classNames,
        itemProp,
        children: product[fieldName]
      });
    }

    return (
      <div className={classNames}>
        {product[fieldName]}
      </div>
    );
  }
}

ProductFieldCustomer.propTypes = {
  element: PropTypes.node,
  fieldName: PropTypes.string,
  itemProp: PropTypes.string,
  product: PropTypes.object
};

registerComponent("ProductFieldCustomer", ProductFieldCustomer);

export default ProductFieldCustomer;
