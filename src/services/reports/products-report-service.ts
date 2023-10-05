export default class ProductsReportService {
    static async getTotalAsCount() {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/reportes/productos/cantidad/total`
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
    static async getLowStockAsCount() {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/reportes/productos/cantidad/stock-bajo`
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
    static async getZeroStockAsCount() {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/reportes/productos/cantidad/sin-stock`
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