import { Proveedor } from "../types";

export default class ProviderService {
  static async getAll() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/proveedores/`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Proveedor[];
    } catch {
      return false;
    }
  }

  static async getById(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/proveedores/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Proveedor;
    } catch {
      return false;
    }
  }

  static async create(provider: Proveedor) {
    try {
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
    } catch {
      return false;
    }
  }

  static async update(id: number, provider: Proveedor) {
    try {
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
    } catch {
      return false;
    }
  }

  static async delete(id: number) {
    try {
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
    } catch {
      return false;
    }
  }
}
