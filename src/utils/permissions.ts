import { Rol } from "../types";

const set = (permissions: Partial<Rol>) => {
  localStorage.setItem("permissions", JSON.stringify(permissions));
};

const find = () => {
  const permissions = localStorage.getItem("permissions");

  if (permissions) {
    return JSON.parse(permissions) as Rol;
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