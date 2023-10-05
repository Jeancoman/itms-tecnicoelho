import { Problema, Response } from "../types";

export default class ProblemService {
  static async getAll(ticket_id: number, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/problemas?page=${page}&size=${size}`
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

  static async getById(ticket_id: number, id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/problemas/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Problema;
    } catch {
      return false;
    }
  }

  static async getBetweenDetectado(
    ticket_id: number,
    añadido_inicial: string,
    añadido_final: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/busqueda/problemas?page=${page}&size=${size}&detectado_inicial=${añadido_inicial}&detectado_final=${añadido_final}`
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

  static async getByState(
    ticket_id: number,
    estado: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/busqueda/problemas?page=${page}&size=${size}&estado=${estado}`
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

  static async getBetweenResuelto(
    ticket_id: number,
    añadido_inicial: string,
    añadido_final: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/busqueda/problemas?page=${page}&size=${size}&resuelto_inicial=${añadido_inicial}&resuelto_final=${añadido_final}`
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

  static async create(ticket_id: number, problem: Problema) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/problemas`,
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
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/problemas/${id}`,
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
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/problemas/${id}`,
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
