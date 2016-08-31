import React, { Component, PropTypes } from "react";
import ReactDOM from "react-dom";
import Helmet from "react-helmet";
import classnames from "classnames";
import { Translation } from "/imports/plugins/core/ui/client/components";
// import SocialButton from "./socialButton"

class SocialButton extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    if (window && document && this.props.isEnabled) {
      $('<div id="fb-root"></div>').appendTo("body");

      window.fbAsyncInit = function () {
        return FB.init({
          appId: apps.facebook.appId,
          xfbml: true,
          version: "v2.1"
        });
      };
      (function (d, s, id) {
        let js = void 0;
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    }
  }

  handleClick = (event) => {
    event.preventDefault();

    if (window) {
      window.open(this.url, "twitter_window", "width=750, height=650");
    }
  }

  get url() {
    const preferredUrl = props.url || location.origin + location.pathname;
    const url = encodeURIComponent(preferredUrl);
    const base = "https://twitter.com/intent/tweet";
    const text = props.title;
    const username = props.username;

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
      )
    }
  }

  render() {
    // return (
    //   <SocialButton
    //     name="twitter"
    //     title="Twitter"
    //     url={this.url}
    //   />
    // )
    const iconClassNames = classnames({
      "fa": true,
      "fa-twitter": this.props.altIcon !== true,
      "fa-twitter-alt": this.props.altIcon,
      [this.props.size]: this.props.size
    });

    return (
      <a className="twitter-share" href="#" onClick={this.handleClick} target="_blank">
        <i className={iconClassNames} />
        {this.renderText()}
      </a>
    );
  }
}

export default SocialButton
