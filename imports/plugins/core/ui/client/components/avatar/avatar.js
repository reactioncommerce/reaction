import React from "react";
import PropTypes from "prop-types";
import Avatar from "react-avatar";
import classnames from "classnames/dedupe";

const ReactionAvatar = (props) => {
  const { className, email, name, size, src, style } = props;

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
      color={props.color}
      currentUser={props.currentUser}
      facebookId={props.facebookId}
      fgColor={props.fgColor}
      googleId={props.googleId}
      md5Email={props.md5Email}
      round={props.round}
      skypeId={props.skypeId}
      textSizeRatio={props.textSizeRatio}
      twitterHandle={props.twitterHandle}
      value={props.value}
      vkontakteId={props.vkontakteId}
    />
  );
};

ReactionAvatar.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  colors: PropTypes.array,
  currentUser: PropTypes.bool,
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
  currentUser: true,
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

export default ReactionAvatar;
