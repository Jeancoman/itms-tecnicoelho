import { Response } from "../../types";

export default class ProvidersReportService {
  static async getTotalAsCount() {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/proveedores/cantidad/total`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as number;

      return data;
    } catch {
      return false;
    }
  }
  static async getNewAsCount() {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/proveedores/cantidad/nuevos`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as number;

      return data;
    } catch {
      return false;
    }
  }

  static async getNews(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/proveedores/nuevos?page=${page}&size=${size}`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as Response;

      if(data.rows.length === 0){
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }

  static async getTopBySalesAmount(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/proveedores/compras?order_by=TOTAL&${page}&size=${size}`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as Response;

      if(data.rows.length === 0){
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }

  static async getTopBySalesQuantity(page: number, size: number) {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/proveedores/compras?order_by=CANTIDAD&page=${page}&size=${size}`
      );

      if (response.status > 300) {
        return false;
      }

      const data = (await response.json()) as Response;

      if(data.rows.length === 0){
        return false;
      }

      return data;
    } catch {
      return false;
    }
  }
}
