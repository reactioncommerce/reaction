import envalid from "envalid";

const { str } = envalid;

export default envalid.cleanEnv(process.env, {
  STRIPE_API_KEY: str({
    desc: "A private Stripe API key"
  })
});
