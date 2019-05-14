import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import GridItemNotice from "../components/gridItemNotice";

const wrapComponent = (Comp) => (
  class GridItemNoticeContainer extends Component {
    static propTypes = {
      product: PropTypes.object
    }

    isLowQuantity = () => this.props.product.isLowQuantity

    isSoldOut = () => this.props.product.isSoldOut

    isBackorder = () => this.props.product.isBackorder

    render() {
      return (
        <Comp
          isLowQuantity={this.isLowQuantity}
          isSoldOut={this.isSoldOut}
          isBackorder={this.isBackorder}
        />
      );
    }
  }
);

registerComponent("GridItemNotice", GridItemNotice, wrapComponent);

export default wrapComponent(GridItemNotice);
