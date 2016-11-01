import React, { Component } from 'react';

export default class ListElement extends Component {
  render() {
    return (
    <div>
    <input type="checkbox"/> {this.props.item} <br/>
    </div>
    );
  }
}
