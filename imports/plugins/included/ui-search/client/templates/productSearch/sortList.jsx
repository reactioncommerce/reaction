import React, { Component } from 'react';

export default class ListElement extends Component {
  render() {
    return (
    <div id="vendor">
    <input type="checkbox" value={this.props.item}/> {this.props.item} <br/>
    </div>
    );
  }
}
