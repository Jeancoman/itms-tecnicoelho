import { Problema } from "../types";

export default class ProblemService {
  static async getAll(ticket_id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/problemas`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Problema[];
    } catch {
      return false;
    }
  }

  static async getById(ticket_id: number, id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/problemas/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Problema;
    } catch {
      return false;
    }
  }

  static async create(ticket_id: number, problem: Problema) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/problemas`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(problem),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Problema;
    } catch {
      return false;
    }
  }

  static async update(ticket_id: number, id: number, problem: Problema) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/problemas/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(problem),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/problemas/${id}`,
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
