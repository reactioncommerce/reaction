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

    alertThem(){
      alert('Something was pressed');
    }

    handleSubmit(event) {
      alert(this.data.product);
    }

  render() {
    return (
      <div style={{'float': 'left', 'width':200, 'margin': '0 20px', 'position': 'relative', 'zIndex': 2000}}>
      <h4>Filter</h4>
      <hr/>
      <div id="score" name="scoreName">
      <h4>Best Sellers</h4>
      <input value="4" name="bestSeller" type="radio"/> &#9733; &#9733; &#9733; &#9733; &#9733;<br/>
      <input value="3" name="bestSeller" type="radio"/> &#9733; &#9733; &#9733; &#9733;<br/>
      <input value="2" name="bestSeller" type="radio"/> &#9733; &#9733; &#9733;<br/>
      <input value="1" name="bestSeller" type="radio"/> &#9733; &#9733;<br/>
      <input value="0" name="bestSeller" type="radio"/> &#9733; <br/>
      </div>
      <hr/>
      <h6>Vendors</h6>
      {this.renderVendors()}
      <hr/>
      <h6>Price</h6>
      <div id="min" style={{'display': 'inline-block'}}>
        min: <input type="text"/>
      </div>
      <div id="max" style={{'display': 'inline-block'}}>
        max: <input type="text"/>
      </div>
      <hr/>
      </div>
    );
  }
}
