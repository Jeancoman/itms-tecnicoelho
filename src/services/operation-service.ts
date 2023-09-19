import { Operación } from "../types";

export default class OperationService {
  static async getAll(ticket_id: number, service_id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/servicios/${service_id}/operaciones`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Operación[];
    } catch {
      return false;
    }
  }

  static async getById(ticket_id: number, service_id: number, id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/servicios/${service_id}/operaciones/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Operación;
    } catch {
      return false;
    }
  }

  static async create(ticket_id: number, service_id: number, operation: Operación) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/${service_id}/operaciones`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(operation),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Operación;
    } catch {
      return false;
    }
  }

  static async update(ticket_id: number, service_id: number, id: number, operation: Operación) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/servicios/${service_id}/operaciones/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(operation),
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

  static async delete(ticket_id: number, service_id: number, id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/servicios/${service_id}/operaciones/${id}`,
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