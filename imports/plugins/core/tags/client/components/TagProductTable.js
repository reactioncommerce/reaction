import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { i18next } from "/client/api";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { tagProductsQuery } from "../../lib/queries";

class TagProductTable extends Component {
  static propTypes = {
    onProductPriorityChange: PropTypes.func,
    shopId: PropTypes.string.isRequired,
    tagId: PropTypes.string
  }

  static defaultProps = {
    tag: {},
    onProductPriorityChange() {}
  }

  handlePriorityChange = (productId, priority) => {
    this.props.onProductPriorityChange(productId, priority);
  }

  render() {
    const { tagId, shopId } = this.props;

    if (!tagId) {
      return null;
    }

    return (
      <Query query={tagProductsQuery} variables={{ tagId, shopId }} fetchPolicy="network-only">
        {({ data }) => {
          const productsByTagId = data && data.productsByTagId;
          let products;
          if (productsByTagId) {
            products = productsByTagId.nodes;
          }


          return (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{i18next.t("admin.tags.form.id")}</TableCell>
                  <TableCell>{i18next.t("admin.tags.form.title")}</TableCell>
                  <TableCell align="right">{i18next.t("admin.tags.form.priority")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(products) && products.map((product) => {
                  const position = product.position !== null && product.position >= 0 ? `${product.position}` : undefined;

                  return (
                    <TableRow key={product._id}>
                      <TableCell component="th" scope="row">{product._id}</TableCell>
                      <TableCell>{product.title}</TableCell>
                      <TableCell align="right">
                        <TextInput
                          value={position}
                          onChange={(value) => {
                            this.handlePriorityChange(product._id, value);
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          );
        }}
      </Query>
    );
  }
}

export default TagProductTable;
