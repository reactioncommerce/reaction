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
import ConfirmDialog from "@reactioncommerce/catalyst/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import Chip from "@reactioncommerce/catalyst/Chip";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme) => ({
  toolbar: {
    paddingLeft: 0,
    paddingRight: 0,
    [theme.breakpoints.up("sm")]: {
      paddingLeft: 0,
      paddingRight: 0
    }
  },
  filterCountContainer: {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(3)
  },
  filterCountText: {
    paddingLeft: theme.spacing(2),
    fontWeight: theme.typography.fontWeightRegular,
    letterSpacing: "0.5px"
  },
  productsTitle: {
    letterSpacing: "0.3px"
  },
  actionDropdownTrigger: {
    border: `1px solid ${theme.palette.colors.coolGrey}`,
    fontSize: theme.typography.fontSize,
    letterSpacing: "0.3px",
    fontWeight: theme.typography.fontWeightSemiBold,
    color: theme.palette.colors.coolGrey500,
    lineHeight: 1.5
  },
  actionDropdownMenuList: {
    border: `1px solid ${theme.palette.colors.black10}`,
    fontSize: theme.typography.fontSize,
    letterSpacing: "0.3px"
  },
  actionDropdownMenuItem: {
    "fontSize": theme.typography.fontSize,
    "letterSpacing": "0.3px"
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

  renderFilteredCount() {
    const { selectedProductIds, totalProductCount, classes } = this.props;
    const selectedCount = selectedProductIds.length;
    const filterByProductIds = Session.get("filterByProductIds");
    const totalCount = i18next.t("admin.productTable.bulkActions.totalCount", { count: totalProductCount });
    const selected = i18next.t("admin.productTable.bulkActions.selectedCount", { count: selectedCount });

    if (filterByProductIds) {
      return (
        <div className={classes.filterCountContainer}>
          <Typography variant="h4" display="inline" className={classes.productsTitle}>
            {i18next.t("admin.productTable.bulkActions.filteredProducts")}
          </Typography>
          <Typography variant="h5" display="inline" className={classes.filterCountText}>
            { selected }
          </Typography>
        </div>
      );
    }

    return (
      <div className={classes.filterCountContainer}>
        <Typography variant="h4" display="inline" className={classes.productsTitle}>
          {i18next.t("admin.productTable.bulkActions.allProducts")}
        </Typography>
        <Typography variant="h5" display="inline" className={classes.filterCountText}>
          {(selectedCount > 0) ? selected : totalCount}
        </Typography>
      </div>
    );
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

  handleShowFilterByFile = () => {
    this.handleCloseBulkActions();
    this.props.onShowFilterByFile();
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

  renderFiles() {
    const { files, handleDelete, isFiltered } = this.props;

    if (isFiltered) {
      return (
        <div>
          {files.map((file) => <Chip label={file.name} onDelete={() => handleDelete(file.name)} />)}
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
          MenuListProps={{ disablePadding: true, className: classes.actionDropdownMenuList }}
        >
          <MenuItem
            disabled
            variant="default"
            className={classes.actionDropdownMenuItem}
          >
            Actions
          </MenuItem>

          <MenuItem
            onClick={this.handleShowFilterByFile}
            variant="default"
            className={classes.actionDropdownMenuItem}
          >
            {i18next.t("admin.productTable.bulkActions.filterByFile")}
          </MenuItem>

          <ConfirmDialog
            title={i18next.t("admin.productTable.bulkActions.publishTitle", { count })}
            message={i18next.t("admin.productTable.bulkActions.publishMessage")}
            onConfirm={this.handleBulkActionPublish}
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
                  labelRowsPerPage={""}
                  labelDisplayedRows={({ page, count }) => `Page ${page+1} of ${count}`}
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
