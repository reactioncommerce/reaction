import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Badge } from "@reactioncommerce/reaction-ui";

const MEDIA_PLACEHOLDER = "/resources/placeholder.gif";

class ProductImage extends Component {
  static propTypes = {
    badge: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    displayMedia: PropTypes.func.isRequired,
    item: PropTypes.shape({
      productId: PropTypes.string,
      quantity: PropTypes.number,
      title: PropTypes.string.isRequired,
      variantId: PropTypes.string
    }).isRequired,
    mode: PropTypes.oneOf(["span", "img", "img-only"]),
    size: PropTypes.string
  }

  static defaultProps = {
    badge: false,
    mode: "img",
    size: "large"
  };

  renderBadge() {
    const { badge, item } = this.props;

    if (!badge) return false;

    return (
      <Badge
        badgeSize="small"
        label={item.quantity}
        status="success"
      />
    );
  }

  render() {
    const { displayMedia, item, mode, size, ...otherProps } = this.props;

    const fileRecord = displayMedia(item);

    let mediaUrl;
    if (fileRecord) {
      mediaUrl = fileRecord.url({ store: size });
    } else {
      mediaUrl = MEDIA_PLACEHOLDER;
    }

    if (mode === "span") {
      return (
        <span className="product-image" style={{ backgroundImage: `url('${mediaUrl}')` }}/>
      );
    } else if (mode === "img-only") {
      return (
        <img
          alt={item.title}
          src={mediaUrl}
          {...otherProps}
        />
      );
    }

    return (
      <div>
        <img
          alt={item.title}
          className={`product-image product-image-${size}`}
          src={mediaUrl}
        />
        {this.renderBadge()}
      </div>
    );
  }
}

registerComponent("ProductImage", ProductImage);

export default ProductImage;
