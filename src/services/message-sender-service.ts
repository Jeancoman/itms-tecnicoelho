export default class MessageSenderService {
  static async send(to: string, content: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/mensajero/enviar`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: to,
            content: content,
          }),
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
