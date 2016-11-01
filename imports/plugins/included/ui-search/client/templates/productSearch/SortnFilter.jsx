import _ from "lodash";
import React from 'react';
import './productResults.html';
import { ProductSearch } from "/lib/collections";
import TrackerReact from 'meteor/ultimatejs:tracker-react';
import ListElement from './sortList.jsx';

export default class SortnFilter extends TrackerReact(React.Component) {
    getProducts() {
      return ProductSearch.find().fetch();
    }

    renderVendors(){
      const products = this.getProducts();
      let vendors = products.map((product) => {
        return product.vendor;
      });
      vendors = _.uniq(vendors);
      return vendors.map((vendor) => {
        return (<ListElement key={vendors.indexOf(vendor)} item={vendor} />);
      });
    }

    handleSubmit(event) {
      alert(this.data.product);
    }

  render() {
    return (
      <div style={{'float': 'left', 'width':200, 'margin': '0 20px'}}>
      <h4>Filter</h4>
      <hr/>
      <h6>Best Sellers</h6>
      <input name="bestSeller" type="radio"/> Black <br/>
      <hr/>
      <h6>Vendors</h6>
      {this.renderVendors()}
      <hr/>
      <h6>Price</h6>
      <div style={{'display': 'inline-block'}}>
        min: <input type="text"/> max: <input type="text"/>
      </div>
      <hr/>
      </div>
    );
  }
}
