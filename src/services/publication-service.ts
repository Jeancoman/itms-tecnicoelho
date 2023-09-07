import { Publicación } from "../types";

export default class PublicationService {
  static async getAll() {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/`
    );

    if (response.status > 300) {
      return false;
    }
    
    return (await response.json()) as Publicación[];
  }

  static async getById(id: number) {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/publicaciones/${id}`
    );

    if (response.status > 300) {
      return false;
    }

    return (await response.json()) as Publicación;
  }


  static async create(publicación: Publicación) {
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
  }

  static async update(id: number, publicación: Publicación) {
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
  }

  static async delete(id: number) {
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
  }
}