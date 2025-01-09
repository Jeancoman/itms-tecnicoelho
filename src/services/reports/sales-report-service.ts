import session from "../../utils/session";

export default class SalesReportService {
  static async getTotalAsCount() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reportes/ventas/cantidad/total`,
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

      const data = (await response.json()) as number;

      return data;
    } catch {
      return false;
    }
  }
  static async getTodayAsCount() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reportes/ventas/cantidad/en?tipo=HOY`,
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

      const data = (await response.json()) as number;

      return data;
    } catch {
      return false;
    }
  }
}
