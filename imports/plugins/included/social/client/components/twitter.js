import React, { Component, PropTypes } from "react";
import Helmet from "react-helmet";
import classnames from "classnames";
import { Translation } from "/imports/plugins/core/ui/client/components";


export function getTwitterMeta(props) {
  const title = props.title || document.title;
  const preferredUrl = props.url || location.origin + location.pathname;
  const url = encodeURIComponent(preferredUrl);
  const username = props.settings.username;
  const description = props.settings.description;

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
    const props = this.props;
    const preferredUrl = props.url || location.origin + location.pathname;
    const url = encodeURIComponent(preferredUrl);
    const base = "https://twitter.com/intent/tweet";
    const text = props.settings.description;
    const username = props.settings.username;

    let href = base + "?url=" + url + "&text=" + text;

    if (username) {
      href += "&via=" + username;
    }

    return href;
  }

  renderText() {
    if (this.props.showText) {
      return (
        <Translation defaultValue="Share on Twitter" i18nKey="social.shareOnTwitter" />
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
      <a className="btn btn-flat twitter-share" aria-label="Share to Twitter" href="#" onClick={this.handleClick}
        target="_blank"
      >
        <Helmet
          meta={getTwitterMeta(this.props)}
        />
        <i className={iconClassNames} />
        {this.renderText()}
      </a>
    );
  }
}

TwitterSocialButton.propTypes = {
  altIcon: PropTypes.bool,
  showText: PropTypes.bool,
  size: PropTypes.string
};

export default TwitterSocialButton;
