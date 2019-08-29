import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatPriceString, i18next } from "/client/api";
import { TableCell, TableRow, Checkbox, IconButton, withStyles } from "@material-ui/core";
import PencilIcon from "mdi-material-ui/Pencil";
import CircleIcon from "mdi-material-ui/CheckboxBlankCircle";

const styles = (theme) => ({
  isVisible: {
    color: theme.palette.colors.forestGreen300,
    fontSize: theme.typography.fontSize * 1.25,
    marginRight: theme.spacing(1)
  },
  isHidden: {
    color: theme.palette.colors.black40,
    fontSize: theme.typography.fontSize * 1.25,
    marginRight: theme.spacing(1)
  },
  tableRow: {
    "& td": {
      borderBottom: "none",
      letterSpacing: "0.28px",
      padding: 0,
      color: theme.palette.colors.coolGrey500
    },
    "& td:first-child": {
      padding: "4px",
      width: "50px"
    },
    "& td:nth-child(2)": {
      width: "60px"
    }
  }
});

class ProductGridItems extends Component {
  static propTypes = {
    classes: PropTypes.object,
    displayPrice: PropTypes.func,
    isSearch: PropTypes.bool,
    isSelected: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onSelect: PropTypes.func,
    pdpPath: PropTypes.func,
    product: PropTypes.object,
    productMedia: PropTypes.object
  }

  static defaultProps = {
    onClick() {},
    onDoubleClick() {},
    productMedia: {
      additionalMedia: null,
      primaryMedia: null
    }
  };

  handleDoubleClick = (event) => {
    this.props.onDoubleClick(event);
  }

  handleClick = (event) => {
    this.props.onClick(event);
  }

  renderMedia() {
    const { productMedia } = this.props;

    const fileRecord = productMedia.primaryMedia;

    if (fileRecord) {
      const mediaUrl = fileRecord.url({ store: "thumbnail" });
      return (
        <img alt="" src={mediaUrl} height={30} />
      );
    }

    return (
      <span>{"-"}</span>
    );
  }

  renderPublishStatus() {
    const { product } = this.props;

    if (product.publishedProductHash === product.currentProductHash) {
      return (
        <span>Published</span>
      );
    }

    return (
      <span>Unpublished</span>
    );
  }

  renderStatusIcon() {
    const { product, classes } = this.props;

    if (product.isVisible) {
      return (
        <div style={{ display: "flex" }}>
          <CircleIcon className={classes.isVisible}/>
          <span>{i18next.t("admin.tags.visible")}</span>
        </div>
      );
    }

    return (
      <div style={{ display: "flex" }}>
        <CircleIcon className={classes.isHidden}/>
        <span>{i18next.t("admin.tags.hidden")}</span>
      </div>
    );
  }

  handleSelect = (event) => {
    this.props.onSelect(event.target.checked, this.props.product);
  }

  render() {
    const { isSelected, product, classes } = this.props;
    const isChecked = isSelected() === "active" || false;
    const productItem = (
      <TableRow className={`product-table-row-item ${isSelected() ? "active" : ""} ${classes.tableRow}`}>
        <TableCell>
          <Checkbox
            onClick={this.handleSelect}
            checked={isChecked}
          />
        </TableCell>
        <TableCell align="center">
          {this.renderMedia()}
        </TableCell>
        <TableCell>
          <Link to={`/operator/products/${product._id}`}>{product.title}</Link>
        </TableCell>
        <TableCell>
          {product._id}
        </TableCell>
        <TableCell>
          {formatPriceString(this.props.displayPrice())}
        </TableCell>
        <TableCell>
          {this.renderPublishStatus()}
        </TableCell>
        <TableCell>
          {this.renderStatusIcon()}
        </TableCell>
        <TableCell>
          <IconButton onClick={this.handleDoubleClick}>
            <PencilIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );

    return productItem;
  }
}

export default withStyles(styles)(ProductGridItems);
