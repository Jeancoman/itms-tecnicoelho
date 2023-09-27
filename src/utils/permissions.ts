import { Permisos } from "../types";

const set = (permissions: Permisos) => {
  sessionStorage.setItem("permissions", JSON.stringify(permissions));
};

const find = () => {
  const permissions = sessionStorage.getItem("permissions");

  if (permissions) {
    return JSON.parse(permissions) as Permisos;
  }

  return null;
};

const revoke = () => {
  sessionStorage.removeItem("permissions");
};

const permissions = {
  set,
  find,
  revoke,
};

export default permissions;