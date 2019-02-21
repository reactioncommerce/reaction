/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";

class ProductGrid extends Component {
  static propTypes = {
    productMediaById: PropTypes.object,
    products: PropTypes.arrayOf(PropTypes.object)
  }

  static defaultProps = {
    productMediaById: {}
  };

  onPageClick = (event) => {
    // Don't trigger the clear selection if we're clicking on a grid item.
    if (event.target.closest(".product-grid-item") === null) {
      const selectedProducts = Session.get("productGrid/selectedProducts");

      // Do we have any selected products?
      // If we do then lets reset the Grid Settings ActionView
      if (Array.isArray(selectedProducts) && selectedProducts.length) {
        // Reset sessions ver of selected products
        Session.set("productGrid/selectedProducts", []);
      }
    }
  }

  renderProductGridItems() {
    const { productMediaById, products } = this.props;

    if (Array.isArray(products) && products.length > 0) {
      return products.map((product, index) => (
        <Components.ProductGridItems
          {...this.props}
          product={product}
          productMedia={productMediaById[product._id]}
          key={index}
          index={index}
        />
      ));
    }

    return (
      <div className="row">
        <div className="text-center">
          <h3>
            <Components.Translation defaultValue="No Products Found" i18nKey="app.noProductsFound" />
          </h3>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell />
                <TableCell>Title</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody id="product-grid-list">
              {this.renderProductGridItems()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }
}

export default ProductGrid;
