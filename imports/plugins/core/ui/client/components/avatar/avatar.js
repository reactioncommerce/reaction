import React, { Component } from "react";
import PropTypes from "prop-types";
import Avatar from "react-avatar";
import classnames from "classnames/dedupe";
import { registerComponent } from "@reactioncommerce/reaction-components";

class ReactionAvatar extends Component {
  render() {
    const { className, email, name, size, src, style } = this.props;

    const classes = classnames({
      "rui": true,
      "rui-avatar": true
    }, className);

    return (
      <Avatar
        className={classes}
        email={email}
        name={name}
        size={size}
        src={src}
        style={style}
        // Below props usually aren't passed, and will use defaults
        color={this.props.color}
        facebookId={this.props.facebookId}
        fgColor={this.props.fgColor}
        googleId={this.props.googleId}
        md5Email={this.props.md5Email}
        round={this.props.round}
        skypeId={this.props.skypeId}
        textSizeRatio={this.props.textSizeRatio}
        twitterHandle={this.props.twitterHandle}
        value={this.props.value}
        vkontakteId={this.props.vkontakteId}
      />
    );
  }
}

ReactionAvatar.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  colors: PropTypes.array,
  email: PropTypes.string,
  facebookId: PropTypes.string,
  fgColor: PropTypes.string,
  googleId: PropTypes.string,
  md5Email: PropTypes.string,
  name: PropTypes.string,
  round: PropTypes.bool,
  size: PropTypes.number,
  skypeId: PropTypes.string,
  src: PropTypes.string,
  style: PropTypes.object,
  textSizeRatio: PropTypes.number,
  twitterHandle: PropTypes.string,
  value: PropTypes.string,
  vkontakteId: PropTypes.string
};

ReactionAvatar.defaultProps = {
  className: null,
  color: null,
  email: null,
  facebookId: null,
  fgColor: "#FFFFFF",
  googleId: null,
  md5Email: null,
  name: null,
  round: true,
  size: 100,
  skypeId: null,
  style: null,
  textSizeRatio: 3,
  twitterHandle: null,
  value: null,
  vkontakteId: null
};

registerComponent("ReactionAvatar", ReactionAvatar);

export default ReactionAvatar;
