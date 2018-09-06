const Enzyme = require("enzyme");
const EnzymeAdapter = require("enzyme-adapter-react-16");

// Setup enzyme react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() });
