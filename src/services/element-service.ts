import { Elemento } from "../types";

export default class ElementService {
  static async getAll(client_id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Elemento[];
    } catch {
      return false;
    }
  }

  static async getById(id: number, client_id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Elemento;
    } catch {
      return false;
    }
  }

  static async create(client_id: number, element: Elemento) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(element),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Elemento;
    } catch {
      return false;
    }
  }

  static async update(id: number, element: Elemento, client_id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/clientes/${client_id}/elementos/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(element),
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

  static async delete(id: number, client_id: number) {
    try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/clientes/${client_id}/elementos/${id}`,
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
