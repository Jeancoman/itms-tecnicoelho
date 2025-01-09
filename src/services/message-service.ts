import { GenericResponse, Mensaje, Response } from "../types";
import session from "../utils/session";

export default class MessageService {
  static async getAll(ticket_id: number, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/mensajes?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
        }
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
        }/api/tickets/${ticket_id}/mensajes/${id}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
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

  static async getBetweenDates(
    ticket_id: number,
    initial_date: string,
    end_date: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/busqueda/mensajes?tipo=ENTRE&creado_inicial=${initial_date}&creado_final=${end_date}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
          },
        }
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
    state: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/busqueda/mensajes?estado=${state}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
        }
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

  static async create(ticket_id: number, message: Mensaje) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/tickets/${ticket_id}/mensajes`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(message),
        }
      );

      return (await response.json()) as {
        message: string;
        status: "success" | "error",
        mensaje: Mensaje
      };
    } catch {
      return {
        message: "El mensaje no pudo ser añadido.",
        status: "error",
        mensaje: undefined
      }
    }
  }

  static async update(ticket_id: number, id: number, message: Mensaje) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/mensajes/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(message),
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "El mensaje no pudo ser editado.",
        status: "error",
      } as GenericResponse;
    }
  }

  static async delete(ticket_id: number, id: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/tickets/${ticket_id}/mensajes/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
        }
      );

      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "El mensaje no pudo ser eliminado.",
        status: "error",
      } as GenericResponse;
    }
  }
}
