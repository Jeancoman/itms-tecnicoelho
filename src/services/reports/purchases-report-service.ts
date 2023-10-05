export default class PurchasesReportService {
  static async getTotalAsCount() {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/compras/cantidad/total`
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
        `${import.meta.env.VITE_BACKEND_URL}/api/reportes/compras/cantidad/en?tipo=HOY`
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
