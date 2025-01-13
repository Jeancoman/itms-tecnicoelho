import { Bitacora, Response } from "../types";
import session from "../utils/session";

export default class BitacoraService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/bitacora?page=${page}&size=${size}`,
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

  static async getById(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/bitacora/${id}`,
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

      return (await response.json()) as Bitacora;
    } catch {
      return false;
    }
  }

  static async getToday(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/bitacora/busqueda-especifica?tipo=HOY&page=${page}&size=${size}`,
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
        }/api/bitacora/busqueda-especifica?tipo=RECIENTEMENTE&page=${page}&size=${size}`,
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
        }/api/bitacora/busqueda-especifica?tipo=ESTA_SEMANA&page=${page}&size=${size}`,
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
        }/api/bitacora/busqueda-especifica?tipo=ESTE_MES&page=${page}&size=${size}`,
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
        }/api/bitacora/busqueda-especifica?tipo=ESTE_AÑO&page=${page}&size=${size}`,
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
        }/api/bitacora/busqueda?page=${page}&size=${size}&fecha_inicial=${start}&fecha_final=${end}`,
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
}
