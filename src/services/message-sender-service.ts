import HmacSHA256 from "crypto-js/hmac-sha256";

export default class MessageSenderService {
  static async send(to: string, content: string) {
    try {
      const datos = {
        telefono: to,
        contenido: content,
      };
  
      const hash = HmacSHA256(
        JSON.stringify(datos),
        `${import.meta.env.VITE_HMAC_KEY}`
      ).toString();
      
      const response = await fetch(
        `${import.meta.env.VITE_MENSAJERO_URL}/enviar`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ datos: datos, hash: hash }),
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

  static async status() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_MENSAJERO_URL}/estado`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as {
        status: string;
      };
    } catch {
      return false;
    }
  }

  static async qr() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_MENSAJERO_URL}/qr`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status > 300) {
        return false;
      }

      return (await response.json()) as {
        status: string;
      };
    } catch {
      return false;
    }
  }
}
