/* global FB, data */
import React, { Component } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import classnames from "classnames";
import { $ } from "meteor/jquery";
import { Components } from "@reactioncommerce/reaction-components";

export function getOpenGraphMeta(props) {
  const url = props.url || location.origin + location.pathname;
  const title = props.title || document.title;
  const { description } = props.settings;

  const meta = [
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: location.hostname },
    { property: "og:url", content: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description }
  ];

  if (props.media) {
    let media;
    if (!/^http(s?):\/\/+/.test(data.media)) {
      media = location.origin + data.media;
    }

    meta.push({
      property: "og:image",
      content: media
    });
  }

  return meta;
}

class FacebookSocialButton extends Component {
  componentDidMount() {
    /* eslint-disable wrap-iife */
    if (window && document) {
      $('<div id="fb-root"></div>').appendTo("body");

      window.fbAsyncInit = () => FB.init({
        appId: this.props.settings.appId,
        xfbml: true,
        version: this.props.settings.version || "v2.7"
      });
      (function (d, s, id) {
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        const js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    }
    /* eslint-enable wrap-iife */
  }

  handleClick = (event) => {
    event.preventDefault();

    if (window.FB) {
      window.FB.ui({
        method: "share",
        display: "popup",
        href: this.props.url
      });
    }
  }

  renderText() {
    if (this.props.showText) {
      return (
        <Components.Translation defaultValue="Share on Facebook" i18nKey="social.shareOnFacebook" />
      );
    }

    return null;
  }

  render() {
    const iconClassNames = classnames({
      "fa": true,
      "fa-facebook": this.props.altIcon !== true,
      "fa-facebook-alt": this.props.altIcon,
      [this.props.size]: this.props.size
    });

    return (
      <Components.Button
        className="btn btn-flat facebook-share"
        aria-label="Share to Facebook"
        onClick={this.handleClick}
      >
        <Helmet
          meta={getOpenGraphMeta(this.props)}
        />
        <i className={iconClassNames} />
        {this.renderText()}
      </Components.Button>
    );
  }
}

FacebookSocialButton.propTypes = {
  altIcon: PropTypes.string,
  media: PropTypes.string,
  settings: PropTypes.object,
  showText: PropTypes.bool,
  size: PropTypes.string,
  url: PropTypes.string
};

export default FacebookSocialButton;
