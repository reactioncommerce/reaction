import React, { Component, PropTypes } from "react";
import { TextField, Button } from "../";

class Metafield extends Component {

  /**
   * Handle form submit
   * @param  {Event} event Event object
   * @return {void} no return value
   */
  handleSubmit = (event) => {
    event.preventDefault();
  }

  handleChange = (event) => {
    if (this.props.onChange) {
      const newMetadata = {
        key: this.refs.keyInput.refs.input.value,
        value: this.refs.valueInput.refs.input.value
      };

      this.props.onChange(event, newMetadata, this.props.index);
    }
  }

  handleBlur = (event) => {
    if (this.props.onBlur) {
      const newMetadata = {
        key: this.refs.keyInput.refs.input.value,
        value: this.refs.valueInput.refs.input.value
      };

      if (newMetadata.key && newMetadata.value) {
        this.props.onBlur(event, newMetadata, this.props.index);
      }
    }
  }

  handleRemove = (event) => {
    if (this.props.onRemove) {
      this.props.onRemove(event, this.props.metafield, this.props.index);
    }
  }

  /**
   * Render a metadata form
   * @return {JSX} metadata forms for each row of metadata
   */
  render() {
    if (this.props.metafield) {
      return (
        <div className="rui list-group-item metafield-list-item">
          <form className="form form-inline" onSubmit={this.handleSubmit}>
            <TextField
              className="metafield-key-input"
              name="key"
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              ref="keyInput"
              value={this.props.metafield.key}
            />
            <TextField
              className="metafield-value-input"
              name="value"
              onBlur={this.handleBlur}
              onChange={this.handleChange}
              ref="valueInput"
              value={this.props.metafield.value}
            />
            <Button icon="times-circle" onClick={this.handleRemove} type="button" />
          </form>
        </div>
      );
    }
    return null;
  }
}

Metafield.defaultProps = {
  editable: true
};

// Prop Types
Metafield.propTypes = {
  index: PropTypes.number,
  metafield: PropTypes.object,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onRemove: PropTypes.func
};

export default Metafield;
