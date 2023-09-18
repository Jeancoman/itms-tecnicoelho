import { Servicio } from "../types";

export default class ServiceService {
  static async getAll(ticket_id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/servicios`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Servicio[];
    } catch {
      return false;
    }
  }

  static async getById(ticket_id: number, id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/servicios/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Servicio;
    } catch {
      return false;
    }
  }

  static async create(ticket_id: number, service: Servicio) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/servicios`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(service),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Servicio;
    } catch {
      return false;
    }
  }

  static async update(ticket_id: number, id: number, service: Servicio) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/servicios/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(service),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/servicios/${id}`,
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