/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { i18next } from "/client/api";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Checkbox from "@material-ui/core/Checkbox";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableFooter from "@material-ui/core/TableFooter";
import Toolbar from "@material-ui/core/Toolbar";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import ChevronDownIcon from "mdi-material-ui/ChevronDown";
import ConfirmDialog from "/imports/client/ui/components/ConfirmDialog";


class ProductGrid extends Component {
  static propTypes = {
    onArchiveProducts: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangeRowsPerPage: PropTypes.func,
    onDuplicateProducts: PropTypes.func,
    onPublishProducts: PropTypes.func,
    onSelectAllProducts: PropTypes.func,
    onSetProductVisibility: PropTypes.func,
    page: PropTypes.number,
    productMediaById: PropTypes.object,
    products: PropTypes.arrayOf(PropTypes.object),
    productsPerPage: PropTypes.number,
    selectedProductIds: PropTypes.arrayOf(PropTypes.string),
    totalProductCount: PropTypes.number
  }

  static defaultProps = {
    onArchiveProducts() {},
    onDuplicateProducts() {},
    onPublishProducts() {},
    onSelectAllProducts() {},
    onSetProductVisibility() {},
    productMediaById: {}
  };

  state = {
    selected: []
  }

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

  handleSelectAll = (event) => {
    const { onSelectAllProducts, products } = this.props;
    const isChecked = event.target.checked;

    if (isChecked) {
      if (Array.isArray(products) && products.length > 0) {
        const selectedIds = products.map((product) => product._id);
        onSelectAllProducts(isChecked, selectedIds);
      }
    } else {
      // Reset selection
      onSelectAllProducts(false);
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

  handleShowBulkActions = (event) => {
    this.setState({ bulkActionMenuAnchorEl: event.currentTarget });
  }

  handleCloseBulkActions = () => {
    this.setState({ bulkActionMenuAnchorEl: null });
  }

  handleBulkActionArchive = () => {
    this.props.onArchiveProducts(this.props.selectedProductIds);
    this.handleCloseBulkActions();
  }

  handleBulkActionDuplicate = () => {
    this.props.onDuplicateProducts(this.props.selectedProductIds);
    this.handleCloseBulkActions();
  }

  handleBulkActionMakeVisible = () => {
    this.props.onSetProductVisibility(this.props.selectedProductIds, true);
    this.handleCloseBulkActions();
  }

  handleBulkActionMakeHidden = () => {
    this.props.onSetProductVisibility(this.props.selectedProductIds, false);
    this.handleCloseBulkActions();
  }

  handleBulkActionPublish = () => {
    this.props.onPublishProducts(this.props.selectedProductIds);
    this.handleCloseBulkActions();
  }

  renderToolbar() {
    const { selectedProductIds } = this.props;
    const { bulkActionMenuAnchorEl } = this.state;
    const count = selectedProductIds.length;

    if (Array.isArray(selectedProductIds) && selectedProductIds.length) {
      return (
        <Toolbar>
          <Button
            aria-owns={bulkActionMenuAnchorEl ? "bulk-actions-menu" : undefined}
            aria-haspopup="true"
            onClick={this.handleShowBulkActions}
            variant="outlined"
          >
            {i18next.t("admin.productTable.bulkActions.actions")}
            <ChevronDownIcon />
          </Button>
          <Menu
            id="bulk-actions-menu"
            anchorEl={bulkActionMenuAnchorEl}
            open={Boolean(bulkActionMenuAnchorEl)}
            onClose={this.handleCloseBulkActions}
          >

            <ConfirmDialog
              title={i18next.t("admin.productTable.bulkActions.publishTitle", { count })}
              message={i18next.t("admin.productTable.bulkActions.publishMessage")}
              onConfirm={this.handleBulkActionPublish}
            >
              {({ openDialog }) => (
                <MenuItem onClick={openDialog}>{i18next.t("admin.productTable.bulkActions.publish")}</MenuItem>
              )}
            </ConfirmDialog>


            <ConfirmDialog
              title={i18next.t("admin.productTable.bulkActions.makeVisibleTitle", { count })}
              message={i18next.t("admin.productTable.bulkActions.makeVisibleMessage")}
              onConfirm={this.handleBulkActionMakeVisible}
            >
              {({ openDialog }) => (
                <MenuItem onClick={openDialog}>{i18next.t("admin.productTable.bulkActions.makeVisible")}</MenuItem>
              )}
            </ConfirmDialog>

            <ConfirmDialog
              title={i18next.t("admin.productTable.bulkActions.makeHiddenTitle", { count })}
              message={i18next.t("admin.productTable.bulkActions.makeHiddenMessage")}
              onConfirm={this.handleBulkActionMakeHidden}
            >
              {({ openDialog }) => (
                <MenuItem onClick={openDialog}>{i18next.t("admin.productTable.bulkActions.makeHidden")}</MenuItem>
              )}
            </ConfirmDialog>

            <ConfirmDialog
              title={i18next.t("admin.productTable.bulkActions.duplicateTitle", { count })}
              message={i18next.t("admin.productTable.bulkActions.duplicateMessage")}
              onConfirm={this.handleBulkActionDuplicate}
            >
              {({ openDialog }) => (
                <MenuItem onClick={openDialog}>{i18next.t("admin.productTable.bulkActions.duplicate")}</MenuItem>
              )}
            </ConfirmDialog>


            <ConfirmDialog
              title={i18next.t("admin.productTable.bulkActions.archiveTitle", { count })}
              message={i18next.t("admin.productTable.bulkActions.archiveMessage")}
              onConfirm={this.handleBulkActionArchive}
            >
              {({ openDialog }) => (
                <MenuItem onClick={openDialog}>{i18next.t("admin.productTable.bulkActions.archive")}</MenuItem>
              )}
            </ConfirmDialog>
          </Menu>
        </Toolbar>
      );
    }

    return null;
  }

  render() {
    const { totalProductCount, page, productsPerPage, onChangePage, onChangeRowsPerPage } = this.props;
    const { isAllSelected } = this.state;

    return (
      <Card>
        {this.renderToolbar()}
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox
                    onClick={this.handleSelectAll}
                    checked={isAllSelected}
                  />
                </TableCell>
                <TableCell />
                <TableCell>Title</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Published</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Visible</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody id="product-grid-list">
              {this.renderProductGridItems()}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={totalProductCount}
                  page={page}
                  rowsPerPage={productsPerPage}
                  rowsPerPageOptions={[10, 24, 50, 100]}
                  onChangePage={onChangePage}
                  onChangeRowsPerPage={onChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    );
  }
}

export default ProductGrid;
