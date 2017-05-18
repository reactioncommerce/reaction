import React, { Component, PropTypes } from "react";
import { Reaction } from "/client/api";

class Brand extends Component {
  static propTypes = {
    logo: PropTypes.oneOfType(
      [PropTypes.bool, PropTypes.object]
    ),
    shop: PropTypes.object
  }

  render() {
    const { logo, shop } = this.props;

    return (
      <a className="brand" href={Reaction.Router.pathFor("/")}>
        {logo &&
          <div className="logo">
            <img src={logo.url()} />
          </div>
        }
        <span className="title">{shop.name}</span>
      </a>
    );
  }
}

export default Brand;
