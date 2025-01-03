import type { Cliente, GenericResponse, Response } from "../types";
import session from "../utils/session";

export default class ClientService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async getById(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/clientes/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Cliente;
    } catch {
      return false;
    }
  }

  static async create(client: Cliente) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/clientes/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(client),
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "Cliente no pudo ser añadido.",
        status: "error",
      } as GenericResponse;
    }
  }

  static async getByNombre(nombre: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/busqueda?tipo=INEXACTA&nombre=${nombre}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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
        }/api/clientes/busqueda?tipo=EXACTA&nombre=${nombre}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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
        }/api/clientes/busqueda?tipo=INEXACTA&apellido=${apellido}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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
        }/api/clientes/busqueda?tipo=EXACTA&apellido=${apellido}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async getByDocumento(documento: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/busqueda?tipo=INEXACTA&documento=${documento}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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
        }/api/clientes/busqueda?tipo=EXACTA&documento=${documento}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async getByTelefono(telefono: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/busqueda?tipo=INEXACTA&telefono=${telefono}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async getByExactTelefono(
    telefono: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/busqueda?tipo=EXACTA&telefono=${telefono}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async update(id: number, client: Cliente) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/clientes/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(client),
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "Cliente no pudo ser editado.",
        status: "error",
      } as GenericResponse;
    }
  }

  static async delete(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/clientes/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "Cliente no pudo ser eliminado.",
        status: "error",
      } as GenericResponse;
    }
  }
}
