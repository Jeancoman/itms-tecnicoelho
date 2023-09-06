import { Permiso, Usuario } from "../types";

export default class UserService {
  static async getAll() {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/`
    );

    if (response.status === 404) {
      return null;
    }
    
    return (await response.json()) as Usuario[];
  }

  static async getById(id: number) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}`
    );

    if (response.status > 300) {
      return false;
    }

    return (await response.json()) as Usuario;
  }

  static async getPermissionsById(id: number) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}/permisos`
    );

    if (response.status > 300) {
      return false;
    }

    return (await response.json()) as Permiso[];
  }

  static async create(user: Usuario) {
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
  }

  static async update(id: number, user: Usuario) {
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
  }

  static async delete(id: number) {
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
  }
}
