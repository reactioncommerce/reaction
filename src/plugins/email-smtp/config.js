import envalid from "envalid";

const { bool, str } = envalid;

export default envalid.cleanEnv(process.env, {
  EMAIL_DEBUG: bool({
    default: false
  }),
  MAIL_URL: str({
    desc: "An SMTP mail url, i.e. smtp://user:pass@example.com:465",
    default: ""
  })
});
