import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { i18next } from "/client/api";
import TextInput from "@reactioncommerce/components/TextInput/v1";
import Button from "@material-ui/core/Button";
import ExpansionPanelActions from "@material-ui/core/ExpansionPanelActions";
import Link from "@material-ui/core/Link";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ChevronRightIcon from "mdi-material-ui/ChevronRight";
import ChevronLeftIcon from "mdi-material-ui/ChevronLeft";
import { tagProductsQuery } from "../../lib/queries";
import { pagination } from "./util/pagination";

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
      <Query query={tagProductsQuery} variables={{ tagId, shopId, first: 20 }} fetchPolicy="network-only">
        {({ data, fetchMore }) => {
          const productsByTagId = data && data.productsByTagId;
          let products;
          if (productsByTagId) {
            products = productsByTagId.nodes;
          }

          const pageInfo = pagination({
            fetchMore,
            data,
            queryName: "productsByTagId",
            limit: 20
          });

          const { hasNextPage, hasPreviousPage, loadNextPage, loadPreviousPage } = pageInfo;

          return (
            <Fragment>
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
                        <TableCell>
                          <Link href={`/operator/products/${product._id}`}>{product.title}</Link>
                        </TableCell>
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
              <ExpansionPanelActions>
                <Button
                  color="primary"
                  disabled={!hasPreviousPage}
                  onClick={loadPreviousPage}
                >
                  <ChevronLeftIcon />
                  {i18next.t("admin.tags.tableText.previousText")}
                </Button>
                <Button
                  color="primary"
                  disabled={!hasNextPage}
                  onClick={loadNextPage}
                >
                  {i18next.t("admin.tags.tableText.nextText")}
                  <ChevronRightIcon />
                </Button>
              </ExpansionPanelActions>
            </Fragment>
          );
        }}
      </Query>
    );
  }
}

export default TagProductTable;
