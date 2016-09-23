import React from "react";
import { Grid, Row } from "react-bootstrap";
import EmailConfig from "../containers/email_config";
import EmailLogs from "../containers/email_logs";

const EmailStatus = () => (
  <Grid fluid style={{ marginTop: "1rem" }}>
    <Row>
      <EmailConfig/>
      <EmailLogs/>
    </Row>
  </Grid>
);


export default EmailStatus;
