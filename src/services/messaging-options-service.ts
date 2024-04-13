import { Mensajería } from "../types";
import session from "../utils/session";

export default class MessagingOptionsService {
  static async get() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/mensajeria/`,
        {
          method: "GET",
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

      return (await response.json()) as Mensajería;
    } catch {
      return false;
    }
  }

  static async update(options: Mensajería) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/mensajeria/`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: session.find()?.token!,
          },
          body: JSON.stringify(options),
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
