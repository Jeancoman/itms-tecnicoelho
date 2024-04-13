import { Imagen, Response } from "../types";
import session from "../utils/session";

export default class ImageService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/imagenes?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async getByUrl(url: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/imagenes/busqueda?tipo=INEXACTA&url=${url}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async getExactUrl(url: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/imagenes/busqueda?tipo=EXACTA&url=${url}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async getDescription(descripcion: string, page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/imagenes/busqueda?tipo=INEXACTA&descripcion=${descripcion}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async getExactDescription(
    descripcion: string,
    page: number,
    size: number
  ) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/imagenes/busqueda?tipo=EXACTA&descripcion=${descripcion}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            Authorization: session.find()?.token!,
            Accept: "application/json",
            "Content-Type": "application/json",
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

  static async create(image: Imagen) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/imagenes/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(image),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Imagen;
    } catch {
      return false;
    }
  }

  static async update(id: number, image: Imagen) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/imagenes/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(image),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/imagenes/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
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
