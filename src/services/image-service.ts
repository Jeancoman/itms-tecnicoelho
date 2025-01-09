import type { GenericResponse, Imagen, Response } from "../types";
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

  static async create(image: Imagen) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/imagenes/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(image),
        }
      );


      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "La imagen no pudo ser añadida.",
        status: "error",
      } as GenericResponse;
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
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(image),
        }
      );


      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "La imagen no pudo ser editada.",
        status: "error",
      } as GenericResponse;
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
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
        }
      );


      return (await response.json()) as GenericResponse;
    } catch {
      return {
        message: "La imagen no pudo ser eliminada.",
        status: "error",
      } as GenericResponse;
    }
  }

  static async upload(imageFile: File) {
    try {
      const formData = new FormData();

      formData.append("image", imageFile);
  
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/imagenes/subir`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: session.find()?.token!,
          },
          body: formData,
        }
      );
  
      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }
  
      return (await response.json()) as {
        message: string,
        status: string,
        url: string
      };
    } catch (error) {
      console.error(error);
      return {
        message: "La imagen no pudo ser subida.",
        status: "error",
        url: undefined
      };
    }
  }
  
}
