/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { Components } from "@reactioncommerce/reaction-components";
import { Session } from "meteor/session";
import { i18next } from "/client/api";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
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
import ConfirmDialog from "@reactioncommerce/catalyst/ConfirmDialog";
import Chip from "@reactioncommerce/catalyst/Chip";
import withStyles from "@material-ui/core/styles/withStyles";

const publishProductsToCatalog = gql`
  mutation ($productIds: [ID]!) {
    publishProductsToCatalog(productIds: $productIds) {
      product {
        productId
        title
        isDeleted
        supportedFulfillmentTypes
        variants {
          _id
          title
          options {
            _id
            title
          }
        }
      }
    }
  }
`;

const styles = (theme) => ({
  leftChip: {
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(1)
  },
  toolbar: {
    marginBottom: theme.spacing(2),
    minHeight: theme.spacing(5),
    paddingLeft: 0,
    paddingRight: 0,
    [theme.breakpoints.up("sm")]: {
      paddingLeft: 0,
      paddingRight: 0
    }
  },
  actionDropdownTrigger: {
    border: `1px solid ${theme.palette.colors.coolGrey}`,
    color: theme.palette.colors.coolGrey500
  },
  actionDropdownMenuItem: {
    fontSize: theme.typography.fontSize,
    letterSpacing: "0.3px"
  },
  tableBody: {
    "& tr:nth-child(odd)": {
      backgroundColor: theme.palette.colors.black02
    }
  },
  tableHead: {
    "& tr th": {
      borderBottom: "none",
      fontWeight: theme.typography.fontWeightSemiBold,
      letterSpacing: "0.5px",
      padding: 0,
      color: theme.palette.colors.coolGrey500
    },
    "& tr th:first-child": {
      padding: "7px 0 1px 4px"
    }
  },
  pagination: {
    borderBottom: "none",
    color: theme.palette.colors.coolGrey500,
    letterSpacing: "0.28px",
    paddingTop: theme.spacing(2)
  }
});

class ProductGrid extends Component {
  static propTypes = {
    classes: PropTypes.object,
    files: PropTypes.arrayOf(PropTypes.object),
    handleDelete: PropTypes.func,
    isFiltered: PropTypes.bool,
    onArchiveProducts: PropTypes.func,
    onChangePage: PropTypes.func,
    onChangeRowsPerPage: PropTypes.func,
    onDisplayTagSelector: PropTypes.func,
    onDuplicateProducts: PropTypes.func,
    onPublishProducts: PropTypes.func,
    onSelectAllProducts: PropTypes.func,
    onSetProductVisibility: PropTypes.func,
    onShowFilterByFile: PropTypes.func,
    page: PropTypes.number,
    productMediaById: PropTypes.object,
    products: PropTypes.arrayOf(PropTypes.object),
    productsPerPage: PropTypes.number,
    selectedProductIds: PropTypes.arrayOf(PropTypes.string),
    setFilteredProductIdsCount: PropTypes.func,
    totalProductCount: PropTypes.number
  }

  static defaultProps = {
    onArchiveProducts() { },
    onDuplicateProducts() { },
    onPublishProducts() { },
    onSelectAllProducts() { },
    onSetProductVisibility() { },
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

  renderFilteredCount() {
    const { selectedProductIds, totalProductCount } = this.props;
    const selectedCount = selectedProductIds.length;
    const filterByProductIds = Session.get("filterByProductIds");
    const totalCount = i18next.t("admin.productTable.bulkActions.totalCount", { count: totalProductCount });
    const selected = i18next.t("admin.productTable.bulkActions.selectedCount", { count: selectedCount });

    if (filterByProductIds) {
      return (
        <CardHeader
          title={i18next.t("admin.productTable.bulkActions.filteredProducts")}
          subheader={selected}
        />
      );
    }

    return (
      <CardHeader
        title={i18next.t("admin.productTable.bulkActions.allProducts")}
        subheader={(selectedCount > 0) ? selected : totalCount}
      />
    );
  }

  renderProductGridItems() {
    const { productMediaById, products } = this.props;
    const { classes, ...notClasses } = this.props;

    if (Array.isArray(products) && products.length > 0) {
      return products.map((product, index) => (
        <Components.ProductGridItems
          {...notClasses}
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

  handleDisplayTagSelector = () => {
    this.handleCloseBulkActions();
    this.props.onDisplayTagSelector(true);
  }

  handleShowFilterByFile = () => {
    this.handleCloseBulkActions();
    this.props.onShowFilterByFile(true);
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

  handleBulkActionPublish = (mutation) => {
    this.props.onPublishProducts(this.props.selectedProductIds, mutation);
    this.handleCloseBulkActions();
  }

  renderFiles() {
    const { files, handleDelete, isFiltered, classes } = this.props;

    if (isFiltered) {
      return (
        <div>
          {files.map((file, idx) => (
            <Chip
              variant="default"
              color="primary"
              label={file.name}
              key={idx}
              className={classes.leftChip}
              onDelete={() => handleDelete(file.name)}
            />
          ))}
        </div>
      );
    }

    return "";
  }

  renderToolbar() {
    const { selectedProductIds, classes } = this.props;
    const { bulkActionMenuAnchorEl } = this.state;
    const count = selectedProductIds.length;
    const isEnabled = Array.isArray(selectedProductIds) && selectedProductIds.length;
    return (
      <Toolbar disableGutters={true} className={classes.toolbar}>
        <Button
          aria-owns={bulkActionMenuAnchorEl ? "bulk-actions-menu" : undefined}
          aria-haspopup="true"
          onClick={this.handleShowBulkActions}
          variant="outlined"
          className={classes.actionDropdownTrigger}
        >
          {i18next.t("admin.productTable.bulkActions.actions")}
          <ChevronDownIcon />
        </Button>
        <Menu
          id="bulk-actions-menu"
          anchorEl={bulkActionMenuAnchorEl}
          open={Boolean(bulkActionMenuAnchorEl)}
          onClose={this.handleCloseBulkActions}
          className={classes.actionDropdownContainer}
          MenuListProps={{ disablePadding: true }}
        >
          <MenuItem
            disabled
            variant="default"
            className={classes.actionDropdownMenuItem}
          >
            Actions
          </MenuItem>
          <MenuItem
            onClick={this.handleDisplayTagSelector}
            variant="default"
            disabled={!isEnabled}
            className={classes.actionDropdownMenuItem}
          >
            {i18next.t("admin.productTable.bulkActions.addRemoveTags")}
          </MenuItem>

          <MenuItem
            onClick={this.handleShowFilterByFile}
            variant="default"
            className={classes.actionDropdownMenuItem}
          >
            {i18next.t("admin.productTable.bulkActions.filterByFile")}
          </MenuItem>

          <Mutation mutation={publishProductsToCatalog}>
            {(mutationFunc, { data, error }) => (
              <Fragment>
                <ConfirmDialog
                  title={i18next.t("admin.productTable.bulkActions.publishTitle", { count })}
                  message={i18next.t("admin.productTable.bulkActions.publishMessage")}
                  onConfirm={() => this.handleBulkActionPublish(mutationFunc)}
                >
                  {({ openDialog }) => (
                    <MenuItem
                      className={classes.actionDropdownMenuItem}
                      onClick={openDialog}
                      disabled={!isEnabled}
                    >
                      {i18next.t("admin.productTable.bulkActions.publish")}
                    </MenuItem>
                  )}
                </ConfirmDialog>
                <span>
                  {error &&
                    Alerts.toast(error.message, "error")
                  }
                  {data &&
                    Alerts.toast(i18next.t("admin.catalogProductPublishSuccess", { defaultValue: "Product published to catalog" }), "success")
                  }
                </span>
              </Fragment>
            )}
          </Mutation>

          <ConfirmDialog
            title={i18next.t("admin.productTable.bulkActions.makeVisibleTitle", { count })}
            message={i18next.t("admin.productTable.bulkActions.makeVisibleMessage")}
            onConfirm={this.handleBulkActionMakeVisible}
          >
            {({ openDialog }) => (
              <MenuItem
                className={classes.actionDropdownMenuItem}
                onClick={openDialog}
                disabled={!isEnabled}
              >
                {i18next.t("admin.productTable.bulkActions.makeVisible")}
              </MenuItem>
            )}
          </ConfirmDialog>

          <ConfirmDialog
            title={i18next.t("admin.productTable.bulkActions.makeHiddenTitle", { count })}
            message={i18next.t("admin.productTable.bulkActions.makeHiddenMessage")}
            onConfirm={this.handleBulkActionMakeHidden}
          >
            {({ openDialog }) => (
              <MenuItem
                className={classes.actionDropdownMenuItem}
                onClick={openDialog}
                disabled={!isEnabled}
              >
                {i18next.t("admin.productTable.bulkActions.makeHidden")}
              </MenuItem>
            )}
          </ConfirmDialog>

          <ConfirmDialog
            title={i18next.t("admin.productTable.bulkActions.duplicateTitle", { count })}
            message={i18next.t("admin.productTable.bulkActions.duplicateMessage")}
            onConfirm={this.handleBulkActionDuplicate}
          >
            {({ openDialog }) => (
              <MenuItem
                className={classes.actionDropdownMenuItem}
                onClick={openDialog}
                disabled={!isEnabled}
              >
                {i18next.t("admin.productTable.bulkActions.duplicate")}
              </MenuItem>
            )}
          </ConfirmDialog>

          <ConfirmDialog
            title={i18next.t("admin.productTable.bulkActions.archiveTitle", { count })}
            message={i18next.t("admin.productTable.bulkActions.archiveMessage")}
            onConfirm={this.handleBulkActionArchive}
          >
            {({ openDialog }) => (
              <MenuItem
                className={classes.actionDropdownMenuItem}
                onClick={openDialog}
                disabled={!isEnabled}
              >
                {i18next.t("admin.productTable.bulkActions.archive")}
              </MenuItem>
            )}
          </ConfirmDialog>
        </Menu>
      </Toolbar>
    );
  }

  render() {
    const { totalProductCount, page, productsPerPage, onChangePage, onChangeRowsPerPage, classes } = this.props;
    const { isAllSelected } = this.state;
    this.props.setFilteredProductIdsCount(totalProductCount);

    return (
      <Card raised>
        {this.renderFilteredCount()}
        <CardContent>
          {this.renderToolbar()}
          {this.renderFiles()}
          <Table>
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>
                  <Checkbox
                    onClick={this.handleSelectAll}
                    checked={isAllSelected}
                  />
                </TableCell>
                <TableCell />
                <TableCell>Title</TableCell>
                <TableCell>Product ID</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Published</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody id="product-grid-list" className={classes.tableBody}>
              {this.renderProductGridItems()}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  className={classes.pagination}
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

export default withStyles(styles)(ProductGrid);
