import React, { Component } from "react";
import PropTypes from "prop-types";
import { Translation } from "/imports/plugins/core/ui/client/components";

class GroupForm extends Component {
  static propTypes = {
    group: PropTypes.object,
    onChange: PropTypes.func
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
              <label htmlFor="name">
                <Translation defaultValue="Name" i18nKey="admin.groups.name" />
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                placeholder="e.g Shop Manager"
                onChange={this.onChange}
                value={this.state.name}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">
                <Translation defaultValue="Description" i18nKey="admin.groups.description" />
              </label>
              <input
                type="text"
                className="form-control"
                id="description"
                name="description"
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
