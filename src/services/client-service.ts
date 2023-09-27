import { Cliente, Response } from "../types";

export default class ClientService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes?page=${page}&size=${size}`
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
        `${import.meta.env.VITE_BACKEND_URL}/api/clientes/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Cliente;
    } catch {
      return false;
    }
  }

  static async create(client: Cliente) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/clientes/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(client),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Cliente;
    } catch {
      return false;
    }
  }

  static async update(id: number, client: Cliente) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/clientes/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(client),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/clientes/${id}`,
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
