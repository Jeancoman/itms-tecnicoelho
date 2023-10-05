import { Session } from "../types";

const set = (session: Session) => {
  localStorage.setItem("session", JSON.stringify(session));
};

const find = () => {
  const session = localStorage.getItem("session");

  if (session) {
    return JSON.parse(session) as Session;
  }

  return null;
};

const revoke = () => {
  localStorage.removeItem("session");
};

const session = {
  set,
  find,
  revoke,
};

export default session;