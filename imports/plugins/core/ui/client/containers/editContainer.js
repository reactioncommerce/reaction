import React, { Children, Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import { EditButton } from "/imports/plugins/core/ui/client/components";
import { composeWithTracker } from "react-komposer";
// import isEqual

class EditContainer extends Component {

  constructor(props) {
    super(props);

    this.handleEditButtonClick = this.handleEditButtonClick.bind(this);
  }

  handleEditButtonClick() {
    const props = this.props;
console.log("OPEN EDIT VIEW????", props);
    Reaction.showActionView({
      label: props.label,
      i18nKeyLabel: props.i18nKeyLabel,
      template: props.editView,
      data: props.data
    });
  }

  renderEditButton() {
    let styles = {}
    if (this.props.data.__draft) {
      console.log("WE HAS A DRAFT!!!", this.props.data);
      styles = {
        backgroundColor: "yellow"
      }
    }
    return (
      <EditButton
        onClick={this.handleEditButtonClick}
        style={styles}
        tooltip="Unpublised changes"
      />
    );
  }

  render() {
    if (this.props.hasPermission) {
      return React.cloneElement(this.props.children, {
        editButton: this.renderEditButton()
      });
    }

    return (
      Children.only(this.props.children)
    );
  }
}

EditContainer.propTypes = {
  children: PropTypes.node,
  hasPermission: PropTypes.bool
};

function composer(props, onData) {
  onData(null, {
    hasPermission: Reaction.hasPermission(props.premissions)
  });
}

export default composeWithTracker(composer)(EditContainer);
