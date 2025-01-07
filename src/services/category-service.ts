import type { Categoría, GenericResponse, Response } from "../types";
import session from "../utils/session";

export default class CategoryService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/categorias?page=${page}&size=${size}`,
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
        `${import.meta.env.VITE_BACKEND_URL}/api/categorias/${id}`,
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

      return (await response.json()) as Categoría;
    } catch {
      return false;
    }
  }

  static async getByNombre(
    nombre: string,
    page: number,
    size: number,
    tipo?: string
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/categorias/busqueda?exactitud=INEXACTA&nombre=${nombre}&page=${page}&size=${size}${
          tipo ? "&tipo=" + tipo : ""
        }`,
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

  static async getByExactNombre(
    nombre: string,
    page: number,
    size: number,
    tipo?: string
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/categorias/busqueda?exactitud=EXACTA&nombre=${nombre}&page=${page}&size=${size}${
          tipo ? "&tipo=" + tipo : ""
        }`,
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

  static async getByTipo(tipo: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/categorias/busqueda?tipo=${tipo}&page=${page}&size=${size}`,
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

  static async create(categorie: Categoría) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/categorias/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(categorie),
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "Categoría no pudo ser añadida.",
        status: "error",
      } as GenericResponse;
    }
  }

  static async update(id: number, categorie: Categoría) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/categorias/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(categorie),
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "Categoría no pudo ser editada.",
        status: "error",
      } as GenericResponse;
    }
  }

  static async delete(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/categorias/${id}`,
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
        message: "Categoría no pudo ser eliminada.",
        status: "error",
      } as GenericResponse;
    }
  }
}
