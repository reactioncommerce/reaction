import React, { Component, PropTypes } from "react";
import { Col, Panel, Table, Button } from "react-bootstrap";
import moment from "moment";

class EmailLogs extends Component {

  renderNoEmails() {
    return (
      <div>
        <h4 className="text-center">No emails sent yet</h4>
      </div>
    );
  }

  renderEmails() {
    return (
      <div>
        <div className="table-controls">
          <div className="table-filter">
            <h5>Quantity</h5>
            <input
              defaultValue={this.props.limit || 10}
              onChange={this.props.updateLimit}
              type="number"/>
          </div>
        </div>
        <Table responsive>
          <thead>
            <tr>
              <th>Email</th>
              <th>Subject</th>
              <th>Sent</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {this.props.emails.map((email) => (
              <tr key={email._id}>
                <td>{email.data.to}</td>
                <td>{email.data.subject}</td>
                <td>{moment(email.created).format("LLL")}</td>
                <td>
                  {email.status === "failed" || email.status === "waiting" ?
                    <Button onClick={this.props.resend.bind(this, email)}>Retry</Button>
                    : email.status}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }

  render() {
    return (
      <Col md={8} sm={12}>
        <Panel>
          <h3 className="text-center">Email Logs</h3>
          <hr/>
          {this.props.emails.length === 0 ?
              this.renderNoEmails()
            : this.renderEmails()}
        </Panel>
      </Col>
    );
  }
}

EmailLogs.propTypes = {
  emails: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    created: PropTypes.instanceOf(Date).isRequired,
    data: PropTypes.shape({
      to: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired
    }),
    status: PropTypes.string.isRequired
  })),
  limit: PropTypes.string,
  resend: PropTypes.func.isRequired,
  updateLimit: PropTypes.func.isRequired
};

export default EmailLogs;
