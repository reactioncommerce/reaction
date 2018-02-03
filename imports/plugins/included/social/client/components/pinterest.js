import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";

class PinterestSocialButton extends Component {
  handleClick = (event) => {
    event.preventDefault();

    if (window) {
      window.open(this.url, "pinterest_window", "width=750, height=650");
    }
  }

  get url() {
    const { props } = this;
    const preferredUrl = props.url || location.origin + location.pathname;
    const url = encodeURIComponent(preferredUrl);
    const { description } = props.settings;
    const baseUrl = "http://www.pinterest.com/pin/create/button/";
    let { media } = props.settings;

    if (props.settings.media) {
      if (!/^http(s?):\/\/+/.test(props.settings.media)) {
        media = location.origin + props.settings.media;
      }
    }

    const href = `${baseUrl}?url=${url}&media=${media}&description=${description}`;

    return href;
  }

  renderText() {
    if (this.props.showText) {
      return (
        <Components.Translation defaultValue="Share on Pinterest" i18nKey="social.shareOnPinterest" />
      );
    }
    return null;
  }

  render() {
    const iconClassNames = classnames({
      "fa": true,
      "fa-pinterest": this.props.altIcon !== true,
      "fa-pinterest-alt": this.props.altIcon,
      [this.props.size]: this.props.size
    });

    return (
      <Components.Button
        className="btn btn-flat pinterest-share"
        aria-label="Share to Pinterest"
        onClick={this.handleClick}
      >
        <i className={iconClassNames} />
        {this.renderText()}
      </Components.Button>
    );
  }
}

PinterestSocialButton.propTypes = {
  altIcon: PropTypes.bool,
  settings: PropTypes.object,
  showText: PropTypes.bool,
  size: PropTypes.string
};

export default PinterestSocialButton;
