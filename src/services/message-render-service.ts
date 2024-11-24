import TemplatingEngine from "../engine/templating-engine";
import { Ticket } from "../types";
import session from "../utils/session";
import TicketService from "./ticket-service";
import TemplateService from "./template-service";

export default class MessageRender {
  static async renderTicketCreationTemplate(ticket_id: number) {
    const template = await TemplateService.getById(1);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const ticket = await TicketService.getById(ticket_id);

    if (ticket === false) {
      return false;
    }

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket?.cliente,
      ticket: ticket,
      usuario: session.find()?.usuario,
    });

    return engine.start();
  }

  static async renderTicketModificationTemplate(
    ticket_id: number,
    ticket_previo: Ticket
  ) {
    const template = await TemplateService.getById(2);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const ticket = await TicketService.getById(ticket_id);

    if (ticket === false) {
      return false;
    }

    const engine = new TemplatingEngine(
      template.contenido,
      {
        cliente: ticket?.cliente,
        ticket: ticket,
        usuario: session.find()?.usuario,
        previamente: {
          ticket: ticket_previo,
        },
      },
      "MODIFICACIÓN",
      "TICKET"
    );

    return engine.start();
  }

  static async renderTicketEliminationTemplate(ticket_previo: Ticket) {
    const template = await TemplateService.getById(3);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket_previo.cliente,
      usuario: session.find()?.usuario,
      ticket: ticket_previo,
    });

    return engine.start();
  }
}
