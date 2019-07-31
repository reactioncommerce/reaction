import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatPriceString, i18next } from "/client/api";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import PencilIcon from "mdi-material-ui/Pencil";

class ProductGridItems extends Component {
  static propTypes = {
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

  handleSelect = (event) => {
    this.props.onSelect(event.target.checked, this.props.product);
  }

  render() {
    const { isSelected, product } = this.props;

    const productItem = (
      <TableRow className={`product-table-row-item ${isSelected() ? "active" : ""}`}>
        <TableCell padding="checkbox">
          <Checkbox
            onClick={this.handleSelect}
            checked={isSelected()}
          />
        </TableCell>
        <TableCell align="center">
          {this.renderMedia()}
        </TableCell>
        <TableCell>
          <Link to={`/operator/products/${product._id}`}>{product.title}</Link>
        </TableCell>
        <TableCell>
          {formatPriceString(this.props.displayPrice())}
        </TableCell>
        <TableCell>
          {this.renderPublishStatus()}
        </TableCell>
        <TableCell>
          {i18next.t(product.isVisible ? "admin.tags.visible" : "admin.tags.hidden")}
        </TableCell>
        <TableCell padding="checkbox">
          <IconButton onClick={this.handleDoubleClick}>
            <PencilIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );

    return productItem;
  }
}

export default ProductGridItems;
