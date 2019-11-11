import envalid from "envalid";

const { str } = envalid;

export default envalid.cleanEnv(process.env, {
  MAIL_URL: str({
    desc: "A test mail service configuration",
    default: "smtp://user:password@email-smtp.us-west-2.amazonaws.com:465"
  })
});
