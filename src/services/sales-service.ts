import { DetalleVenta, Venta } from "../types";

export default class SaleService {
  static async getAll() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ventas/`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Venta[];
    } catch {
      return false;
    }
  }

  static async getById(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ventas/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Venta;
    } catch {
      return false;
    }
  }

  static async create(sale: Venta) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ventas/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sale),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Venta;
    } catch {
      return false;
    }
  }

  static async update(id: number, sale: Venta) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ventas/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sale),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/ventas/${id}`,
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

   static async createDetails(id: number, details: DetalleVenta[]) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ventas/${id}/detalles`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(details),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Venta;
    } catch {
      return false;
    }
  }

  static async updateDetails(id: number, details: DetalleVenta[]) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ventas/${id}/detalles`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(details),
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

  static async deleteDetails(id: number, details: DetalleVenta[]) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/ventas/${id}/detalles`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(details),
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