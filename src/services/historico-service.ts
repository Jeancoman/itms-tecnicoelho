import { HistoricoInventario, Response } from "../types";
import session from "../utils/session";

export default class HistoricoService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/historico-inventario?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
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
        `${import.meta.env.VITE_BACKEND_URL}/api/historico-inventario/${id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as HistoricoInventario;
    } catch {
      return false;
    }
  }

  static async getToday(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/historico-inventario/busqueda-especifica?tipo=HOY&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
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

  static async getRecent(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/historico-inventario/busqueda-especifica?tipo=RECIENTEMENTE&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
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

  static async getThisWeek(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/historico-inventario/busqueda-especifica?tipo=ESTA_SEMANA&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
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

  static async getThisMonth(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/historico-inventario/busqueda-especifica?tipo=ESTE_MES&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
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

  static async getThisYear(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/historico-inventario/busqueda-especifica?tipo=ESTE_AÑO&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
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
        }/api/historico-inventario/busqueda?page=${page}&size=${size}&fecha_inicial=${start}&fecha_final=${end}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
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

  static async create(historico: HistoricoInventario) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/historico-inventario/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(historico),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as HistoricoInventario;
    } catch {
      return false;
    }
  }

  static async update(id: number, historico: HistoricoInventario) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/historico-inventario/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(historico),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/historico-inventario/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
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
