import React, { Component, PropTypes } from "react";
import {
  Button,
  DropDownMenu,
  MenuItem,
  Translation,
  Toolbar,
  ToolbarGroup
} from "/imports/plugins/core/ui/client/components/";
import { PublishContainer } from "/imports/plugins/core/revisions";

class ProductToolbar extends Component {
  static propTypes = {
    editable: PropTypes.bool,
    hasAdminPermission: PropTypes.bool,
    onDeleteProduct: PropTypes.func,
    onProductFieldChange: PropTypes.func,
    onViewContextChange: PropTypes.func,
    product: PropTypes.object,
    viewAs: PropTypes.string
  }

  get product() {
    return this.props.product || {};
  }

  get editable() {
    return this.props.editable;
  }

  handleVisibilityChange = (event, isProductVisible) => {
    if (this.props.onProductFieldChange) {
      this.props.onProductFieldChange(this.product._id, "isVisible", isProductVisible);
    }
  }

  handlePublishActions = (event, action) => {
    if (action === "archive" && this.props.onDeleteProduct) {
      this.props.onDeleteProduct(this.product);
    }
  }

  render() {
    /*
    <Toolbar>
      <ToolbarGroup firstChild={true}>

        <DropDownMenu
          buttonElement={<Button label="Switch" />}
          onChange={this.props.onViewContextChange}
          value={this.props.viewAs}
        >
          <MenuItem label="Administrator" value="administrator" />
          <MenuItem label="Customer" value="customer" />
        </DropDownMenu>
      </ToolbarGroup>
      <ToolbarGroup lastChild={true}>
        <PublishContainer
          documentIds={[this.product._id]}
          documents={[this.product]}
          onVisibilityChange={this.handleVisibilityChange}
          onAction={this.handlePublishActions}
        />
      </ToolbarGroup>
    </Toolbar>
     */


    if (this.props.hasAdminPermission) {
      return (
        <PublishContainer
          value={this.props.viewAs}
          documentIds={[this.product._id]}
          documents={[this.product]}
          onVisibilityChange={this.handleVisibilityChange}
          onAction={this.handlePublishActions}
          onViewContextChange={this.props.onViewContextChange}
        />
      );
    }

    return null;
  }
}

export default ProductToolbar;
