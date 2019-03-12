import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router";
import { compose } from "recompose";

/**
 * Create a new product
 * @returns {undefined} No return
 */
export async function handleCreateProduct() {
  const promise = await new Promise((resolve, reject) => {
    Meteor.call("products/createProduct", (error, result) => {
      if (error) {
        reject(error);
      } else if (result) {
        // go to new product
        resolve({ newProductId: result });
      }
    });
  });

  return promise;
}

const wrapComponent = (Comp) => {
  /**
   * Create product HOC
   * @param {Object} props Component props
   * @returns {Node} React component
   */
  function withCreateProduct(props) {
    return (
      <Comp
        onCreateProduct={async () => {
          try {
            const { newProductId } = await handleCreateProduct();
            props.history.push(`/operator/products/${newProductId}`);
          } catch (error) {
            Alerts.toast("Couldn't create new product", "error");
          }
        }}
        {...props}
      />
    );
  }

  withCreateProduct.propTypes = {
    history: PropTypes.object
  };

  return withCreateProduct;
};

export default compose(
  withRouter,
  wrapComponent
);
