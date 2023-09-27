import { Session } from "../types";

const set = (session: Session) => {
  sessionStorage.setItem("session", JSON.stringify(session));
};

const find = () => {
  const session = sessionStorage.getItem("session");

  if (session) {
    return JSON.parse(session) as Session;
  }

  return null;
};

const revoke = () => {
  sessionStorage.removeItem("session");
};

const session = {
  set,
  find,
  revoke,
};

export default session;