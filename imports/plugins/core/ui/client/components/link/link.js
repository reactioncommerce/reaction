import React, { Component } from "react";
import PropTypes from "prop-types";

export default class Link extends Component {
  static propTypes = {
    href: PropTypes.string.isRequired
  };

  handleClick = (event) => {
    event.preventDefault();
    ReactionRouter.go(this.props.href); // eslint-disable-line no-undef
    window.scrollTo(0, 0);
  };

  render() {
    const { href, children } = this.props; // eslint-disable-line react/prop-types
    return (
      <a href={href} {...this.props} onClick={this.handleClick}>
        {children}
      </a>
    );
  }
}
