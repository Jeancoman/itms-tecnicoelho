import { Publicación, Response } from "../types";
import session from "../utils/session";

export default class PublicationService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/publicaciones?page=${page}&size=${size}`,
        {
          method: "GET",
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
        `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/${id}`,
        {
          method: "GET",
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

      return (await response.json()) as Publicación;
    } catch {
      return false;
    }
  }

  static async getByTitulo(titulo: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/busqueda?tipo=INEXACTA&titulo=${titulo}&page=${page}&size=${size}`,
        {
          method: "GET",
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

      const data = (await response.json()) as Response;

      if (data.rows.length === 0) {
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }

  static async getByExactTitulo(titulo: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/busqueda?tipo=EXACTA&titulo=${titulo}&page=${page}&size=${size}`,
        {
          method: "GET",
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

      const data = (await response.json()) as Response;

      if (data.rows.length === 0) {
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }

  static async create(publicación: Publicación) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(publicación),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Publicación;
    } catch {
      return false;
    }
  }

  static async update(id: number, publicación: Publicación) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(publicación),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/${id}`,
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
