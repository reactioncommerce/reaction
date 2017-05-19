import React, { Component, PropTypes } from "react";

class Brand extends Component {
  static propTypes = {
    handleClick: PropTypes.func,
    logo: PropTypes.oneOfType(
      [PropTypes.bool, PropTypes.object]
    ),
    shop: PropTypes.object
  }

  render() {
    const { handleClick, logo, shop } = this.props;

    return (
      <a className="brand" onClick={handleClick}>
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
