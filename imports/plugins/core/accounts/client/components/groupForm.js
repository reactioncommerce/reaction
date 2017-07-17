import React, { Component } from "react";
import PropTypes from "prop-types";

class GroupForm extends Component {
  static propTypes = {
    group: PropTypes.object,
    onChange: PropTypes.func,
    saveGroup: PropTypes.func
  };

  constructor(props) {
    super(props);
    const { name, description } = props.group;

    this.state = {
      name: name || "",
      description: description || ""
    };
  }

  componentWillReceiveProps(nextProps) {
    const { name, description } = nextProps.group;
    this.setState({ name: name || "", description: description || "" });
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
    if (this.props.onChange) {
      this.props.onChange({ [event.target.name]: event.target.value });
    }
  };

  onBlur = () => {
    if (this.props.saveGroup) {
      this.props.saveGroup();
    }
  };

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    // TODO: i18n
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <form className="add-group">
            <div className="form-group">
              <label htmlFor="name"><span>Name</span></label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                placeholder="e.g Shop Manager"
                onChange={this.onChange}
                onBlur={this.onBlur}
                value={this.state.name}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description"><span>Description</span></label>
              <input
                type="text"
                className="form-control"
                id="description"
                name="description"
                placeholder="e.g manages all orders etc"
                onChange={this.onChange}
                value={this.state.description}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default GroupForm;
