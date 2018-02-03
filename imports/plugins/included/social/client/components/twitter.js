import React, { Component } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import classnames from "classnames";
import { Components } from "@reactioncommerce/reaction-components";


export function getTwitterMeta(props) {
  const title = props.title || document.title;
  const preferredUrl = props.url || location.origin + location.pathname;
  const url = encodeURIComponent(preferredUrl);
  const { username, description } = props.settings;

  const meta = [
    { property: "twitter:card", content: "summary" },
    { property: "twitter:creator", content: username },
    { property: "twitter:url", content: url },
    { property: "twitter:title", content: title },
    { property: "twitter:description", content: description }
  ];

  if (props.media) {
    let media;

    if (!/^http(s?):\/\/+/.test(props.media)) {
      media = location.origin + props.media;
    }

    meta.push({
      property: "twitter:image",
      content: media
    });
  }
}

class TwitterSocialButton extends Component {
  handleClick = (event) => {
    event.preventDefault();

    if (window) {
      window.open(this.url, "twitter_window", "width=750, height=650");
    }
  }

  get url() {
    const { props } = this;
    const preferredUrl = props.url || location.origin + location.pathname;
    const url = encodeURIComponent(preferredUrl);
    const base = "https://twitter.com/intent/tweet";
    const { username, description } = props.settings;

    let href = `${base}?url=${url}&text=${description}`;

    if (username) {
      href += `&via=${username}`;
    }

    return href;
  }

  renderText() {
    if (this.props.showText) {
      return (
        <Components.Translation defaultValue="Share on Twitter" i18nKey="social.shareOnTwitter" />
      );
    }
    return null;
  }

  render() {
    const iconClassNames = classnames({
      "fa": true,
      "fa-twitter": this.props.altIcon !== true,
      "fa-twitter-alt": this.props.altIcon,
      [this.props.size]: this.props.size
    });

    return (
      <Components.Button
        className="btn btn-flat twitter-share"
        aria-label="Share to Twitter"
        onClick={this.handleClick}
      >
        <Helmet
          meta={getTwitterMeta(this.props)}
        />
        <i className={iconClassNames} />
        {this.renderText()}
      </Components.Button>
    );
  }
}

TwitterSocialButton.propTypes = {
  altIcon: PropTypes.bool,
  settings: PropTypes.object,
  showText: PropTypes.bool,
  size: PropTypes.string
};

export default TwitterSocialButton;
