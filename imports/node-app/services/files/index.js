import ReactionService from "../../core/ReactionService";
import startup from "./startup";

const service = new ReactionService({ startup });
service.start();

export default service;
