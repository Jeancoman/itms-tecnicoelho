import { Producto } from "../types";

export default class ProductService {
  static async getAll() {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/productos/`
    );

    if (response.status > 300) {
      return false;
    }
    
    return (await response.json()) as Producto[];
  }

  static async getById(id: number) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/productos/${id}`
    );

    if (response.status > 300) {
      return false;
    }

    return (await response.json()) as Producto;
  }


  static async create(product: Producto) {
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
  }

  static async update(id: number, product: Producto) {
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
  }

  static async delete(id: number) {
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
  }
}