import { Cliente } from "../types";

export default class ClientService {
  static async getAll() {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/clientes/`
    );

    if (response.status > 300) {
      return false;
    }
    
    return (await response.json()) as Cliente[];
  }

  static async getById(id: number) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/clientes/${id}`
    );

    if (response.status > 300) {
      return false;
    }

    return (await response.json()) as Cliente;
  }


  static async create(client: Cliente) {
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
  }

  static async update(id: number, client: Cliente) {
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
  }

  static async delete(id: number) {
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
  }
}