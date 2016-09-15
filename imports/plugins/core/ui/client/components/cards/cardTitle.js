import React, { Component, PropTypes } from "react";
import { Translation } from "../translation";

class CardTitle extends Component {

  render() {
    const { element, ...props } = this.props;

    if (element) {
      return React.cloneElement(element, props);
    }

    return (
      <h3 className="panel-title">
        <Translation defaultValue={this.props.title} i18nKey={this.props.i18nKeyTitle} />
        {this.props.children}
      </h3>
    );
  }
}

CardTitle.propTypes = {
  children: PropTypes.node,
  element: PropTypes.node,
  i18nKeyTitle: PropTypes.string,
  title: PropTypes.string
};

export default CardTitle;
