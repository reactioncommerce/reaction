import envalid from "envalid";

const { str, testOnly } = envalid;

export default envalid.cleanEnv(process.env, {
  MAIL_URL: str({
    desc: "A test mail service configuration",
    devDefault: testOnly("smtp://user:password@email-smtp.us-west-2.amazonaws.com:465")
  })
});
