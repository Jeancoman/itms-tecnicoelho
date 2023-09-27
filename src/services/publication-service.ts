import { Publicación, Response } from "../types";

export default class PublicationService {
  static async getAll(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/publicaciones?page=${page}&size=${size}`
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
        `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/${id}`
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Publicación;
    } catch {
      return false;
    }
  }

  static async create(publicación: Publicación) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(publicación),
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Publicación;
    } catch {
      return false;
    }
  }

  static async update(id: number, publicación: Publicación) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(publicación),
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
        `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/${id}`,
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
