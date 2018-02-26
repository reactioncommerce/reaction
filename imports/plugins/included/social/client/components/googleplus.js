import React, { Component } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";


export function getGooglePlusMeta(props) {
  const preferredUrl = props.url || location.origin + location.pathname;
  const url = encodeURIComponent(preferredUrl);
  const { description } = props.settings;

  const meta = [
    { property: "itemprop:name", content: location.hostname },
    { property: "itemprop:url", content: url },
    { property: "itemprop:description", content: description }
  ];

  if (props.media) {
    let media;

    if (!/^http(s?):\/\/+/.test(props.media)) {
      media = location.origin + props.media;
    }

    meta.push({
      property: "itemprop:image",
      content: media
    });
  }
  return meta;
}

class GooglePlusSocialButton extends Component {
  handleClick = (event) => {
    event.preventDefault();

    if (window) {
      window.open(this.url, "googleplus_window", "width=750, height=650");
    }
  }

  get url() {
    const { url, settings } = this.props;
    const { description } = this.props.settings;
    const preferredUrl = url || location.origin + location.pathname;
    const encodedUrl = encodeURIComponent(preferredUrl);
    let href = `https://plus.google.com/share?url=${encodedUrl}`;
    if (settings.description) {
      href += `&text=${description}`;
    }
    return href;
  }

  renderText() {
    if (this.props.showText) {
      return (
        <Components.Translation defaultValue="Share on GooglePlus" i18nKey="social.shareOnGooglePlus" />
      );
    }
    return null;
  }

  render() {
    const iconClassNames = classnames({
      "fa": true,
      "fa-google-plus": this.props.altIcon !== true,
      "fa-google-plus-alt": this.props.altIcon,
      [this.props.size]: this.props.size
    });

    return (
      <Components.Button
        className="btn btn-flat googleplus-share"
        aria-label="Share to Google Plus"
        onClick={this.handleClick}
      >
        <Helmet
          meta={getGooglePlusMeta(this.props)}
        />
        <i className={iconClassNames} />
        {this.renderText()}
      </Components.Button>
    );
  }
}

GooglePlusSocialButton.propTypes = {
  altIcon: PropTypes.bool,
  settings: PropTypes.object,
  showText: PropTypes.bool,
  size: PropTypes.string,
  url: PropTypes.string
};

export default GooglePlusSocialButton;
