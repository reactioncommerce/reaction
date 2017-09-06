import React, { Component } from "react";
import PropTypes from "prop-types";
import { Badge } from "@reactioncommerce/reaction-ui";


class ProductImage extends Component {
  static propTypes = {
    badge: PropTypes.bool,
    displayMedia: PropTypes.func,
    item: PropTypes.object,
    size: PropTypes.string
  }

  renderBadge() {
    const { badge, item } = this.props;

    if (badge === true) {
      return (
        <Badge
          badgeSize="small"
          label={item.quantity}
          status="success"
        />
      );
    }
    return false;
  }

  renderMedia() {
    const { displayMedia, item, size } = this.props;
    let mediaUrl;

    if (displayMedia(item)) {
      mediaUrl = displayMedia(item).url();
    } else {
      mediaUrl = "/resources/placeholder.gif";
    }

    return (
      <div>
        <img
          alt={item.title}
          className={`procuct-image product-image-${size}`}
          src={mediaUrl}
        />
        {this.renderBadge()}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderMedia()}
      </div>
    );
  }
}

export default ProductImage;
