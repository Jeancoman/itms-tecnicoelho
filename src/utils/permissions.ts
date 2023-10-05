import { Permisos } from "../types";

const set = (permissions: Permisos) => {
  localStorage.setItem("permissions", JSON.stringify(permissions));
};

const find = () => {
  const permissions = localStorage.getItem("permissions");

  if (permissions) {
    return JSON.parse(permissions) as Permisos;
  }

  return null;
};

const revoke = () => {
  localStorage.removeItem("permissions");
};

const permissions = {
  set,
  find,
  revoke,
};

export default permissions;