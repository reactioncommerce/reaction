import envalid, { testOnly } from "envalid";

const { str } = envalid;

export default envalid.cleanEnv(process.env, {
  STRIPE_API_KEY: str({
    desc: "A private Stripe API key",
    devDefault: testOnly("YOUR_PRIVATE_STRIPE_API_KEY")
  })
});
