import React, { Component, PropTypes } from "react";
import { Col, Panel, Table, Button } from "react-bootstrap";
import moment from "moment";

class EmailLogs extends Component {

  renderNoEmails() {
    return (
      <div>
        <h4 className="text-center" data-i18n="mail.logs.noEmails">No emails sent yet</h4>
      </div>
    );
  }

  renderEmails() {
    return (
      <div>
        <div className="table-controls">
          <div className="table-filter">
            <h5 data-i18n="mail.logs.limit">Quantity</h5>
            <input
              defaultValue={this.props.limit || 10}
              onChange={this.props.updateLimit}
              type="number"/>
          </div>
        </div>
        <Table responsive>
          <thead>
            <tr>
              <th data-i18n="mail.logs.headers.email">Email</th>
              <th data-i18n="mail.logs.headers.subject">Subject</th>
              <th data-i18n="mail.logs.headers.sent">Sent</th>
              <th data-i18n="mail.logs.headers.status">Status</th>
              <th data-i18n="mail.logs.headers.actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.props.emails.map((email) => (
              <tr key={email._id}>
                <td>{email.data.to}</td>
                <td>{email.data.subject}</td>
                <td>{moment(email.updated).format("LLL")}</td>
                <td>{email.status}</td>
                <td>
                  {email.status === "failed" || email.status === "waiting" ?
                    <Button
                      onClick={this.props.resend.bind(this, email)}
                      data-i18n="mail.logs.retry">
                      Retry
                    </Button>
                    : <span data-i18n="mail.logs.noneAvailble">None available</span>}
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
          <h3 className="text-center" data-i18n="mail.logs.headers.emailLogs">Email Logs</h3>
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
