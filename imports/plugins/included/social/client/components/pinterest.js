import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import { Translation } from "/imports/plugins/core/ui/client/components";

class PinterestSocialButton extends Component {
  handleClick = (event) => {
    event.preventDefault();

    if (window) {
      window.open(this.url, "pinterest_window", "width=750, height=650");
    }
  }

  get url() {
    const props = this.props;
    const preferredUrl = props.url || location.origin + location.pathname;
    const url = encodeURIComponent(preferredUrl);
    const description = props.settings.description;
    const baseUrl = "http://www.pinterest.com/pin/create/button/";
    let media = props.settings.media;

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
        <Translation defaultValue="Share on Pinterest" i18nKey="social.shareOnPinterest" />
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
      <a className="btn btn-flat pinterest-share" aria-label="Share to Pinterest" href={this.url} onClick={this.handleClick}
        target="_blank"
      >
        <i className={iconClassNames} />
        {this.renderText()}
      </a>
    );
  }
}

PinterestSocialButton.propTypes = {
  altIcon: PropTypes.bool,
  showText: PropTypes.bool,
  size: PropTypes.string
};

export default PinterestSocialButton;
