import { Opciones } from "../types";

const set = (options: Opciones) => {
  sessionStorage.setItem("options", JSON.stringify(options));
};

const find = () => {
  const options = sessionStorage.getItem("options");

  if (options) {
    return JSON.parse(options) as Opciones;
  }

  return null;
};

const revoke = () => {
  sessionStorage.removeItem("options");
};

const options = {
  set,
  find,
  revoke,
};

export default options;
