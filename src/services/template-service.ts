import { Plantilla, Response } from "../types";

export default class TemplateService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/mensajeria/plantillas?page=${page}&size=${size}`
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

  static async getById(id: number) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/mensajeria/plantillas/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Plantilla;
    } catch {
      return false;
    }
  }

  static async update(id: number, template: Plantilla) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/mensajeria/plantillas/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(template),
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