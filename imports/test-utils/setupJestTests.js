const Enzyme = require("enzyme");
const EnzymeAdapter = require("enzyme-adapter-react-16");

// Setup enzyme react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() });

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection:", err); // eslint-disable-line no-console
  process.exit(10); // eslint-disable-line no-process-exit
});
