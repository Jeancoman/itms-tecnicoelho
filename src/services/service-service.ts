import { Servicio, Response } from "../types";

export default class ServiceService {
  static async getAll(ticket_id: number, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/servicios?page=${page}&size=${size}`
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
        }/api/tickets/${ticket_id}/servicios/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Servicio;
    } catch {
      return false;
    }
  }

  static async getBetweenAñadido(ticket_id: number, añadido_inicial: string, añadido_final: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/busqueda/servicios?page=${page}&size=${size}&añadido_inicial=${añadido_inicial}&añadido_final=${añadido_final}`
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

    static async getBetweenIniciado(ticket_id: number, añadido_inicial: string, añadido_final: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/busqueda/servicios?page=${page}&size=${size}&iniciado_inicial=${añadido_inicial}&iniciado_final=${añadido_final}`
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

  static async getByState(ticket_id: number, estado: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/busqueda/servicios?page=${page}&size=${size}&estado=${estado}`
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

  static async getBetweenCompletado(ticket_id: number, añadido_inicial: string, añadido_final: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/busqueda/servicios?page=${page}&size=${size}&completado_inicial=${añadido_inicial}&completado_final=${añadido_final}`
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

  static async create(ticket_id: number, service: Servicio) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/servicios`,
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
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/servicios/${id}`,
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
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/servicios/${id}`,
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
