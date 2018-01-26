import * as PayFlow from "./payflow";
import * as Express from "./express";

export const PayPal = Object.assign({}, Express.Express, PayFlow.PayFlow);
