import envalid from "envalid";

const { cleanEnv, bool } = envalid;


export default cleanEnv(
  process.env,
  {
    LOAD_SAMPLE_DATA: bool({
      default: false,
      desc: "Flag to decide whether sample data has to be loaded",
      choices: [true, false]
    })
  },
  {
    dotEnvPath: null
  }
);
