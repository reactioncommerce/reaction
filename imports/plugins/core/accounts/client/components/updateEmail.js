import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { Components } from "@reactioncommerce/reaction-components";

const removeAccountEmailRecord = gql`
  mutation removeAccountEmailRecord($input: RemoveAccountEmailRecordInput!) {
    removeAccountEmailRecord(input: $input) {
      clientMutationId
      account {
        _id
      }
    }
  }
`;


class UpdateEmail extends Component {
  static propTypes = {
    accountId: PropTypes.string,
    email: PropTypes.string,
    handleUpdateEmail: PropTypes.func.isRequired,
    uniqueId: PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      email: props.email,
      showSpinner: false
    };
  }

  handleFieldChange = (event, value, field) => {
    this.setState({
      [field]: value
    });
  }

  handleSubmit = (event, mutation) => {
    event.preventDefault;

    const { accountId, email } = this.props;

    this.setState({ showSpinner: true });
    const options = {
      accountId,
      newEmail: this.state.email,
      mutation,
      oldEmail: email
    };
    this.props.handleUpdateEmail(options, () => this.setState({ showSpinner: false }));
  }

  render() {
    const { showSpinner } = this.state;

    return (
      <Mutation mutation={removeAccountEmailRecord}>
        {(mutationFunc) => (
          <Fragment>
            <Components.TextField
              i18nKeyLabel="accountsUI.emailAddress"
              label="Email Address"
              name="email"
              type="email"
              id={`email-${this.props.uniqueId}`}
              value={this.state.email}
              onChange={this.handleFieldChange}
            />
            <Components.Button
              bezelStyle={"solid"}
              icon={showSpinner ? "fa fa-spin fa-circle-o-notch" : ""}
              i18nKeyLabel={showSpinner ? "accountsUI.updatingEmailAddress" : "accountsUI.updateEmailAddress"}
              label={showSpinner ? "Updating Email Address" : "Update Email Address"}
              status={"primary"}
              onClick={() => this.handleSubmit(event, mutationFunc)}
              disabled={this.state.email === this.props.email}
            />
          </Fragment>
        )}
      </Mutation>
    );
  }
}

export default UpdateEmail;
