import { Usuario, Response, GenericResponse } from "../types";
import session from "../utils/session";

export default class UserService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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

  static async getAccesos(id: number, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/${id}/accesos?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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

  static async getById(id: number, token?: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token || token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
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

  static async getByNombre(nombre: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/busqueda?exactitud=INEXACTA&nombre=${nombre}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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
        }/api/usuarios/busqueda?tipo=EXACTA&nombre=${nombre}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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
        }/api/usuarios/busqueda?exactitud=INEXACTA&apellido=${apellido}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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
        }/api/usuarios/busqueda?exactitud=EXACTA&apellido=${apellido}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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
        }/api/usuarios/busqueda?exactitud=INEXACTA&usuario=${usuario}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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
        }/api/usuarios/busqueda?exactitud=EXACTA&usuario=${usuario}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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

  static async getByExactDocumento(
    documento: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/busqueda?exactitud=EXACTA&documento=${documento}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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

  static async getByExactCorreo(
    correo: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/busqueda?exactitud=EXACTA&correo=${correo}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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

  static async create(user: Usuario) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(user),
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "El usuario no pudo ser añadido.",
        status: "error",
      } as GenericResponse;
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
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(user),
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "El usuario no pudo ser editado.",
        status: "error",
      } as GenericResponse;
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
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "El usuario no pudo ser eliminado.",
        status: "error",
      } as GenericResponse;
    }
  }

  static async signIn(nombre_usuario: string, contraseña: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/login`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
          body: JSON.stringify({
            nombre_usuario: nombre_usuario,
            contraseña: contraseña,
          }),
        }
      );

      if (response.status === 429) {
        return "429";
      }

      if (response.status > 300) {
        return false;
      }

      return (await response.json()).token as string;
    } catch {
      return false;
    }
  }

  static async requestPasswordReset(email: string) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/usuarios/request-password-reset`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
          body: JSON.stringify({
            correo: email,
          }),
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

  static async resetPassword(userId: string, token: string, password: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/password-reset`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
          body: JSON.stringify({
            userId,
            token,
            password,
          }),
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
