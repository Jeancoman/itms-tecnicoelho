import { Producto } from "../types";

export default class ProductService {
  static async getAll() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/productos/`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Producto[];
    } catch {
      return false;
    }
  }

  static async getById(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/productos/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Producto;
    } catch {
      return false;
    }
  }

  static async create(product: Producto) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/productos/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Producto;
    } catch {
      return false;
    }
  }

  static async update(id: number, product: Producto) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/productos/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/productos/${id}`,
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
