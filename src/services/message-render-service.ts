import TemplatingEngine from "../engine/templating-engine";
import { Operación, Problema, Servicio, Ticket } from "../types";
import session from "../utils/session";
import OperationService from "./operation-service";
import ProblemService from "./problem-service";
import ServiceService from "./service-service";
import TemplateService from "./template-service";
import TicketService from "./ticket-service";

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

    console.log(ticket);

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      usuario: session.find()?.usuario,
      categoría_de_elemento: ticket.elemento?.categoría,
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

    console.log(ticket);

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      usuario: session.find()?.usuario,
      previamente: {
        ticket: ticket_previo,
      },
      categoría_de_elemento: ticket.elemento?.categoría,
    }, "MODIFICACIÓN", "TICKET");

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
      cliente: ticket_previo.elemento?.cliente,
      elemento: ticket_previo.elemento,
      usuario: session.find()?.usuario,
      ticket: ticket_previo,
      categoría_de_elemento: ticket_previo.elemento?.categoría,
    });

    return engine.start();
  }

  static async renderServicioCreationTemplate(
    ticket_id: number,
    servicio_id: number
  ) {
    const template = await TemplateService.getById(7);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const ticket = await TicketService.getById(ticket_id);

    if (ticket === false) {
      return false;
    }

    const servicio = await ServiceService.getById(ticket_id, servicio_id);

    if (servicio === false) {
      return false;
    }

    console.log(ticket);

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      servicio: servicio,
      usuario: session.find()?.usuario,
      categoría_de_elemento: ticket.elemento?.categoría,
      categoría_de_servicio: servicio.categoría,
    });

    return engine.start();
  }

  static async renderServicioModificationTemplate(
    ticket_id: number,
    servicio_id: number,
    servicio_previo: Servicio
  ) {
    const template = await TemplateService.getById(8);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const ticket = await TicketService.getById(ticket_id);

    if (ticket === false) {
      return false;
    }

    const servicio = await ServiceService.getById(ticket_id, servicio_id);

    if (servicio === false) {
      return false;
    }

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      servicio: servicio,
      usuario: session.find()?.usuario,
      previamente: {
        servicio: servicio_previo,
      },
      categoría_de_elemento: ticket.elemento?.categoría,
      categoría_de_servicio: servicio.categoría,
    }, "MODIFICACIÓN", "SERVICIO");

    return engine.start();
  }

  static async renderServicioEliminationTemplate(
    ticket_id: number,
    servicio_previo: Servicio
  ) {
    const template = await TemplateService.getById(9);

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
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      usuario: session.find()?.usuario,
      servicio: servicio_previo,
      categoría_de_elemento: ticket.elemento?.categoría,
      categoría_de_servicio: servicio_previo.categoría,
    });

    return engine.start();
  }

  static async renderOperaciónCreationTemplate(
    ticket_id: number,
    servicio_id: number,
    operación_id: number
  ) {
    const template = await TemplateService.getById(10);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const ticket = await TicketService.getById(ticket_id);

    if (ticket === false) {
      return false;
    }

    const servicio = await ServiceService.getById(ticket_id, servicio_id);

    if (servicio === false) {
      return false;
    }

    const operación = await OperationService.getById(
      ticket_id,
      servicio_id,
      operación_id
    );

    if (operación === false) {
      return false;
    }

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      servicio: servicio,
      operación: operación,
      usuario: session.find()?.usuario,
      categoría_de_elemento: ticket.elemento?.categoría,
      categoría_de_servicio: servicio?.categoría,
    });

    return engine.start();
  }

  static async renderOperaciónModificationTemplate(
    ticket_id: number,
    servicio_id: number,
    operación_id: number,
    operación_previa: Operación
  ) {
    const template = await TemplateService.getById(11);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const ticket = await TicketService.getById(ticket_id);

    if (ticket === false) {
      return false;
    }

    const servicio = await ServiceService.getById(ticket_id, servicio_id);

    if (servicio === false) {
      return false;
    }

    const operación = await OperationService.getById(
      ticket_id,
      servicio_id,
      operación_id
    );

    if (operación === false) {
      return false;
    }

    console.log(ticket);

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      servicio: servicio,
      operación: operación,
      usuario: session.find()?.usuario,
      previamente: {
        operación: operación_previa
      },
      categoría_de_elemento: ticket.elemento?.categoría,
      categoría_de_servicio: servicio?.categoría,
    }, "MODIFICACIÓN", "OPERACIÓN");

    return engine.start();
  }

  static async renderOperaciónEliminationTemplate(
    ticket_id: number,
    servicio_id: number,
    operación_previa: Operación
  ) {
    const template = await TemplateService.getById(11);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const ticket = await TicketService.getById(ticket_id);

    if (ticket === false) {
      return false;
    }

    const servicio = await ServiceService.getById(ticket_id, servicio_id);

    if (servicio === false) {
      return false;
    }

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      servicio: servicio,
      operación: operación_previa,
      usuario: session.find()?.usuario,
      categoría_de_elemento: ticket.elemento?.categoría,
      categoría_de_servicio: servicio?.categoría,
    });

    return engine.start();
  }

  static async renderProblemaModicationTemplate(
    ticket_id: number,
    problema_id: number,
    problema_previamente: Problema
  ) {
    const template = await TemplateService.getById(5);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const ticket = await TicketService.getById(ticket_id);

    if (ticket === false) {
      return false;
    }

    const problema = await ProblemService.getById(ticket_id, problema_id);

    if (problema === false) {
      return false;
    }

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      problema: problema,
      previamente: {
        problema: problema_previamente
      },
      usuario: session.find()?.usuario,
      categoría_de_elemento: ticket.elemento?.categoría,
    }, "MODIFICACIÓN", "PROBLEMA");

    return engine.start();
  }

  static async renderProblemaCreationTemplate(
    ticket_id: number,
    problema_id: number,
  ) {
    const template = await TemplateService.getById(4);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return "Plantilla desactivada";
    }

    const ticket = await TicketService.getById(ticket_id);

    if (ticket === false) {
      return false;
    }

    const problema = await ProblemService.getById(ticket_id, problema_id);

    if (problema === false) {
      return false;
    }

    const engine = new TemplatingEngine(template.contenido, {
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      problema: problema,
      usuario: session.find()?.usuario,
      categoría_de_elemento: ticket.elemento?.categoría,
    });

    return engine.start();
  }

  static async renderProblemaEliminationTemplate(
    ticket_id: number,
    problema_previamente: Problema,
  ) {
    const template = await TemplateService.getById(6);

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
      cliente: ticket.elemento?.cliente,
      ticket: ticket,
      elemento: ticket.elemento,
      problema: problema_previamente,
      usuario: session.find()?.usuario,
      categoría_de_elemento: ticket.elemento?.categoría,
    });

    return engine.start();
  }
}
