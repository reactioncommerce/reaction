import bunyan from "bunyan";
import bunyanFormat from "bunyan-format";
import Bunyan2Loggly from "bunyan-loggly";

const level = "INFO";

// default console config (stdout)
const streams = [{
  level,
  stream: bunyanFormat({ outputMode: "short" })
}];

// Loggly config (only used if configured)
const logglyToken = process.env.LOGGLY_TOKEN;
const logglySubdomain = process.env.LOGGLY_SUBDOMAIN;

if (logglyToken && logglySubdomain) {
  const logglyStream = {
    type: "raw",
    level: "INFO",
    stream: new Bunyan2Loggly({
      token: logglyToken,
      subdomain: logglySubdomain
    })
  };
  streams.push(logglyStream);
}


const Avalogger = bunyan.createLogger({
  name: "Avalara",
  streams
});

export default Avalogger;
