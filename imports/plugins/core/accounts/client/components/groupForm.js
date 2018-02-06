import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class GroupForm extends Component {
  static propTypes = {
    createGroup: PropTypes.func,
    group: PropTypes.object,
    i18nKeyLabel: PropTypes.string,
    submitLabel: PropTypes.string,
    updateGroup: PropTypes.func
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
    this.setState({ name, description });
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.props.createGroup) {
      return this.props.createGroup(this.state);
    }
    if (this.props.updateGroup) {
      return this.props.updateGroup(this.props.group._id, this.state);
    }
  };

  render() {
    return (
      <div className="panel panel-default">
        <div className="panel-body">
          <form className="add-group">
            <div className="form-group">
              <Components.TextField
                i18nKeyLabel="admin.groups.name"
                label="Name"
                name="name"
                id="add-group-name"
                type="text"
                value={this.state.name}
                onChange={this.onChange}
              />
            </div>
            <div className="form-group">
              <Components.TextField
                i18nKeyLabel="admin.groups.description"
                label="Description"
                name="description"
                id="add-group-description"
                type="text"
                value={this.state.description}
                onChange={this.onChange}
              />
            </div>
            <div className="justify">
              <Components.Button
                status="primary"
                buttonType="submit"
                onClick={this.handleSubmit}
                bezelStyle="solid"
                i18nKeyLabel={this.props.i18nKeyLabel}
                label={this.props.submitLabel}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

registerComponent("GroupForm", GroupForm);

export default GroupForm;
