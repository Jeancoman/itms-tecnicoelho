import type { Asset } from "../types";
import session from "../utils/session";

export default class RespaldoService {
  static async getAll() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/respaldo/listar`,
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

      const data = (await response.json()) as Asset[];

      return data;
    } catch {
      return [];
    }
  }

  static async create() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/respaldo/crear`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
            Authorization: session.find()?.token!,
          },
        }
      );

      if (response.status > 300) {
        throw new Error();
      }

      return await response.json();
    } catch {
      throw new Error();
    }
  }

  static async restore(public_id: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/respaldo/restaurar`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify({
            public_id,
          }),
        }
      );

      if (response.status > 300) {
        throw new Error();
      }

      return await response.json();
    } catch {
      throw new Error();
    }
  }

  static async delete(public_id: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/respaldo/eliminar/`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify({
            public_id,
          }),
        }
      );

      if (response.status > 300) {
        throw new Error();
      }

      return await response.json();
    } catch {
      throw new Error();
    }
  }
}
