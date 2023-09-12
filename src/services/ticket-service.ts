import { Ticket } from "../types";

export default class TicketService {
  static async getAll() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Ticket[];
    } catch {
      return false;
    }
  }

  static async getById(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Ticket;
    } catch {
      return false;
    }
  }

  static async create(ticket: Ticket) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticket),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Ticket;
    } catch {
      return false;
    }
  }

  static async update(id: number, ticket: Ticket) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticket),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${id}`,
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
