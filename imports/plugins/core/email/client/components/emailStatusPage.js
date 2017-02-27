import React from "react";
import { Grid, Row } from "react-bootstrap";
import EmailConfig from "../containers/emailConfig";
import EmailLogs from "../containers/emailLogs";

const EmailStatus = () => (
  <Grid fluid style={{ marginTop: "1rem" }}>
    <Row>
      <EmailConfig/>
      <EmailLogs/>
    </Row>
  </Grid>
);


export default EmailStatus;
