import { Ticket } from "../types";

export default class TicketService {
  static async getAll() {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/tickets/`
    );

    if (response.status > 300) {
      return false;
    }
    
    return (await response.json()) as Ticket[];
  }

  static async getById(id: number) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${id}`
    );

    if (response.status > 300) {
      return false;
    }

    return (await response.json()) as Ticket;
  }


  static async create(ticket: Ticket) {
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
  }

  static async update(id: number, ticket: Ticket) {
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
  }

  static async delete(id: number) {
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
  }
}