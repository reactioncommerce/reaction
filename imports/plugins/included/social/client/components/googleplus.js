import React, { Component, PropTypes } from "react";
import Helmet from "react-helmet";
import classnames from "classnames";
import { Translation } from "/imports/plugins/core/ui/client/components";


export function getGooglePlusMeta(props) {
  const preferredUrl = props.url || location.origin + location.pathname;
  const url = encodeURIComponent(preferredUrl);
  const description = props.settings.description;

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
}

class GooglePlusSocialButton extends Component {
  handleClick = (event) => {
    event.preventDefault();

    if (window) {
      window.open(this.url, "googleplus_window", "width=750, height=650");
    }
  }

  get url() {
    const props = this.props;
    const preferredUrl = props.url || location.origin + location.pathname;
    const url = encodeURIComponent(preferredUrl);
    const href = "https://plus.google.com/share?url=" + url;

    return href;
  }

  renderText() {
    if (this.props.showText) {
      return (
        <Translation defaultValue="Share on GooglePlus" i18nKey="social.shareOnGooglePlus" />
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
      <a className="btn btn-flat googleplus-share" aria-label="Share to Google Plus" href="#" onClick={this.handleClick}
        target="_blank"
      >
        <Helmet
          meta={getGooglePlusMeta(this.props)}
        />
        <i className={iconClassNames} />
        {this.renderText()}
      </a>
    );
  }
}

GooglePlusSocialButton.propTypes = {
  altIcon: PropTypes.bool,
  showText: PropTypes.bool,
  size: PropTypes.string
};

export default GooglePlusSocialButton;
