import React, { Component } from "react";

class Brand extends Component {
  render() {
    return (
      <div>
        <a className="brand" href="/">
          {this.props.logo &&
            <div className="logo">
              <img src={this.props.logo.url()} />
            </div>
          }
          <span className="title">{this.props.shop.name}</span>
        </a>
      </div>
    );
  }
}

export default Brand;
