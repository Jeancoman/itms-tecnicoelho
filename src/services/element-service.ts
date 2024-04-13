import { Elemento, Response, Seguimiento } from "../types";
import session from "../utils/session";

export default class ElementService {
  static async getAll(client_id: number, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos?page=${page}&size=${size}`,
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

  static async getById(id: number, client_id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos/${id}`,
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

      return (await response.json()) as Elemento;
    } catch {
      return false;
    }
  }

  static async getByExactNombre(
    cliente_id: number,
    nombre: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/busqueda/${cliente_id}/elementos?page=${page}&size=${size}&nombre=${nombre}&exactitud=EXACTA`,
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

  static async getByNombre(
    cliente_id: number,
    nombre: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/busqueda/${cliente_id}/elementos?page=${page}&size=${size}&nombre=${nombre}&exactitud=INEXACTA`,
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

  static async getByCategoryId(
    cliente_id: number,
    categoria_id: number,
    nombre: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/busqueda/${cliente_id}/elementos?page=${page}&size=${size}&nombre=${nombre}&categoria_id=${categoria_id}`,
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

  static async create(client_id: number, element: Elemento) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(element),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Elemento;
    } catch {
      return false;
    }
  }

  static async update(id: number, element: Elemento, client_id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(element),
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

  static async delete(id: number, client_id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
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

  static async getSeguimientos(client_id: number, element_id: number, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos/${element_id}/seguimiento?page=${page}&size=${size}`,
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

  static async createSeguimiento(client_id: number, element_id: number, element: Seguimiento) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos/${element_id}/seguimiento`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(element),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Elemento;
    } catch {
      return false;
    }
  }

  static async updateSeguimiento(id: number, element: Seguimiento, client_id: number, element_id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos/${element_id}/seguimiento/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(element),
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

  static async deleteSeguimiento(id: number, client_id: number, element_id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos/${element_id}/seguimiento/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
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
