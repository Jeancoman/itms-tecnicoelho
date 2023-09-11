import { Proveedor } from "../types";

export default class ProviderService {
  static async getAll() {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/proveedores/`
    );

    if (response.status > 300) {
      return false;
    }
    
    return (await response.json()) as Proveedor[];
  }

  static async getById(id: number) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/proveedores/${id}`
    );

    if (response.status > 300) {
      return false;
    }

    return (await response.json()) as Proveedor;
  }


  static async create(provider: Proveedor) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/proveedores/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(provider),
      }
    );

    if (response.status > 300) {
      return false;
    }

    return (await response.json()) as Proveedor;
  }

  static async update(id: number, provider: Proveedor) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/proveedores/${id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(provider),
      }
    );

    if (response.status > 300) {
      return false;
    }

    return true;
  }

  static async delete(id: number) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/proveedores/${id}`,
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