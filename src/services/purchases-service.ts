import { DetalleCompra, Compra, Response } from "../types";

export default class PurchaseService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/compras?page=${page}&size=${size}`
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
        `${import.meta.env.VITE_BACKEND_URL}/api/compras/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Compra;
    } catch {
      return false;
    }
  }

  static async getToday(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/compras/en?tipo=HOY&page=${page}&size=${size}`
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

  static async getRecent(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/compras/en?tipo=RECIENTEMENTE&page=${page}&size=${size}`
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

  static async getThisWeek(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/compras/en?tipo=ESTA_SEMANA&page=${page}&size=${size}`
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

  static async getThisMonth(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/compras/en?tipo=ESTE_MES&page=${page}&size=${size}`
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

  static async getThisYear(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/compras/en?tipo=ESTE_AÑO&page=${page}&size=${size}`
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

  static async getBetween(
    start: string,
    end: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/compras/busqueda?page=${page}&size=${size}&fecha_inicial=${start}&fecha_final=${end}`
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

  static async getByProvider(
    proveedor_id: number,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/compras/busqueda?page=${page}&size=${size}&proveedor_id=${proveedor_id}`
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

  static async create(purchase: Compra) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/compras/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(purchase),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Compra;
    } catch {
      return false;
    }
  }

  static async update(id: number, purchase: Compra) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/compras/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(purchase),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/compras/${id}`,
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

  static async createDetails(id: number, details: DetalleCompra[]) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/compras/${id}/detalles`,
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

      return (await response.json()) as Compra;
    } catch {
      return false;
    }
  }

  static async updateDetails(id: number, details: DetalleCompra[]) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/compras/${id}/detalles`,
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

  static async deleteDetails(id: number, details: DetalleCompra[]) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/compras/${id}/detalles`,
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
