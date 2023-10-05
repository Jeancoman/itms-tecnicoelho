import { Opciones } from "../types";

const set = (options: Opciones) => {
  localStorage.setItem("options", JSON.stringify(options));
};

const find = () => {
  const options = localStorage.getItem("options");

  if (options) {
    return JSON.parse(options) as Opciones;
  }

  return null;
};

const revoke = () => {
  localStorage.removeItem("options");
};

const options = {
  set,
  find,
  revoke,
};

export default options;
