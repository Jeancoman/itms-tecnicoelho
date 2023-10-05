export default class UsersReportService {
  static async getTotalAsCount() {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/reportes/usuarios/cantidad/total`
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
