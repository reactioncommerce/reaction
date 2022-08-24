import envalid from "envalid";

const { str, testOnly } = envalid;

export default envalid.cleanEnv(
  process.env,
  {
    STRIPE_API_KEY: str({
      desc: "A private Stripe API key",
      devDefault: testOnly("YOUR_PRIVATE_STRIPE_API_KEY"),
      default: "ABC"
    })
  },
  {
    dotEnvPath: null
  }
);

