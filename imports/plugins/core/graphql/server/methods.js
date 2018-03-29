import runMeteorMethodWithContext from "./runMeteorMethodWithContext";

const methods = {};

[
  "accounts/addressBookAdd",
  "accounts/addressBookUpdate",
  "group/addUser"
].forEach((methodName) => {
  methods[methodName] = (context, args) => (
    runMeteorMethodWithContext(context, methodName, args)
  );
});

export default methods;
