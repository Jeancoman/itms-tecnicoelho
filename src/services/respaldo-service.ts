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
            Authorization: session.find()?.token!,
          },
        }
      );

      return await response.json();
    } catch {
      return null;
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
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify({
            public_id,
          }),
        }
      );

      return await response.json();
    } catch {
      return null;
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
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify({
            public_id,
          }),
        }
      );

      return await response.json();
    } catch {
      return null;
    }
  }
}
