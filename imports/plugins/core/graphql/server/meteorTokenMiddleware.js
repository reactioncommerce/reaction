import getUserFromToken from "./getUserFromToken";

export default function meteorTokenMiddleware(headerName, contextFromOptions) {
  return async (req, res, next) => {
    // get the login token from the headers request, given by the Meteor's
    // network interface middleware if enabled
    const token = req.headers[headerName];

    if (!token) {
      next();
      return;
    }

    try {
      // get the current user
      req.user = await getUserFromToken(token, contextFromOptions);
      next();
    } catch (error) {
      res.sendStatus(401);
    }
  };
}
