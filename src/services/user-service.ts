import { Permisos, Usuario, Response } from "../types";

export default class UserService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios?page=${page}&size=${size}`
      );

      if (response.status === 404) {
        return false;
      }

      const data = (await response.json()) as Response;

      if (data.rows.length === 0) {
        return false;
      }

      return data;
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

  static async getByNombre(nombre: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/busqueda?exactitud=INEXACTA&nombre=${nombre}&page=${page}&size=${size}`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as Response;

      if (data.rows.length === 0) {
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }

  static async getByExactNombre(nombre: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/busqueda?tipo=EXACTA&nombre=${nombre}&page=${page}&size=${size}`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as Response;

      if (data.rows.length === 0) {
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }

  static async getByApellido(apellido: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/busqueda?exactitud=INEXACTA&apellido=${apellido}&page=${page}&size=${size}`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as Response;

      if (data.rows.length === 0) {
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }

  static async getByExactApellido(
    apellido: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/busqueda?exactitud=EXACTA&apellido=${apellido}&page=${page}&size=${size}`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as Response;

      if (data.rows.length === 0) {
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }

  static async getByNombreUsuario(usuario: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/busqueda?exactitud=INEXACTA&usuario=${usuario}&page=${page}&size=${size}`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as Response;

      if (data.rows.length === 0) {
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }

  static async getByExactNombreUsuario(
    usuario: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/busqueda?exactitud=EXACTA&usuario=${usuario}&page=${page}&size=${size}`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as Response;

      if (data.rows.length === 0) {
        return false;
      }

      return data;
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

      return (await response.json()) as Permisos;
    } catch {
      return false;
    }
  }

  static async patchPermissionsById(id: number, permissions: Permisos) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}/permisos`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(permissions),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Permisos;
    } catch {
      return false;
    }
  }

  static async postPermissionsById(id: number, permissions: Permisos) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}/permisos`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(permissions),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Permisos;
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

  static async signIn(nombre_usuario: string, contraseña: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre_usuario: nombre_usuario,
            contraseña: contraseña,
          }),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()).token as string;
    } catch {
      return false;
    }
  }
}
