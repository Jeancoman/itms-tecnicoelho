import { Mensaje } from "../types";

export default class MessageService {
  static async getAll(ticket_id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/mensajes`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Mensaje[];
    } catch {
      return false;
    }
  }

  static async getById(ticket_id: number, id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/mensajes/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Mensaje;
    } catch {
      return false;
    }
  }

  static async create(ticket_id: number, message: Mensaje) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/mensajes`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Mensaje;
    } catch {
      return false;
    }
  }

  static async update(ticket_id: number, id: number, message: Mensaje) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/mensajes/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
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

  static async delete(ticket_id: number, id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/mensajes/${id}`,
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