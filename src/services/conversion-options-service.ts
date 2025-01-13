import { Conversion } from "../types";
import session from "../utils/session";

export default class ConversionOptionsService {
  static async get() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/conversion/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
            Authorization: session.find()?.token!,
          },
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as Conversion;
    } catch {
      return false;
    }
  }

  static async update(options: Conversion) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/conversion/`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Connection": "keep-alive",
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