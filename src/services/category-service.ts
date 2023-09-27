import { Categoría, Response } from "../types";

export default class CategoryService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/categorias?page=${page}&size=${size}`
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
        `${import.meta.env.VITE_BACKEND_URL}/api/categorias/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Categoría;
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
          },
          body: JSON.stringify(categorie),
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

  static async update(id: number, categorie: Categoría) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/categorias/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(categorie),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/categorias/${id}`,
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
