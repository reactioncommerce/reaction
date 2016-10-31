import React from 'react';
import './productResults.html';

export default class SortnFilter extends React.Component{
  render() {
    return (
      <div style={{'float': 'left', 'width':200, 'margin': '0 20px'}}>
      <h4>Filter</h4>
      <hr/>
      <h6>Best Sellers</h6>
      <input type="radio"/> Black <br/>
      <input type="radio"/> Blue<br/>
      <hr/>
      <h6>Brand</h6>
      <input type="checkbox"/> Katie<br/>
      <input type="checkbox"/> Halumba<br/>
      <input type="checkbox"/> Tarafine<br/>
      <input type="checkbox"/> Clamaitius<br/>
      <hr/>
      <h6>Newest Color</h6>
      <hr/>
      <h6>Price</h6>
      <div style={{'display': 'inline-block'}}>
        min: <input type="text"/> max: <input type="text"/>
      </div>
      <hr/>
      <h6>Tag</h6>
      </div>
    );
  }
}
