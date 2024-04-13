import session from "../../utils/session";

export default class TicketsReportService {
    static async getTotalAsCount() {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/reportes/tickets/cantidad/total`,
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
  
        const data = (await response.json()) as number;
  
        return data;
      } catch {
        return false;
      }
    }
  }