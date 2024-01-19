import envalid from "envalid";

const { cleanEnv, bool, json } = envalid;


export default cleanEnv(
  process.env,
  {
    LOAD_SAMPLE_DATA: bool({
      default: false,
      desc: "Flag to decide whether sample data has to be loaded",
      choices: [true, false]
    }),
    SEQUENCE_INITIAL_VALUES: json({ default: { entity: 999 } })
  },
  {
    dotEnvPath: null
  }
);
