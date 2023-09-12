import { Permiso, Usuario } from "../types";

export default class UserService {
  static async getAll() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/`
      );

      if (response.status === 404) {
        return null;
      }

      return (await response.json()) as Usuario[];
    } catch {
      return false;
    }
  }

  static async getById(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Usuario;
    } catch {
      return false;
    }
  }

  static async getPermissionsById(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}/permisos`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Permiso[];
    } catch {
      return false;
    }
  }

  static async create(user: Usuario) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Usuario;
    } catch {
      return false;
    }
  }

  static async update(id: number, user: Usuario) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  static async delete(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status > 300) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
