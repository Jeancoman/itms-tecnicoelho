import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Ticket,
  Cliente,
  Elemento,
  Selected,
  Mensaje,
  Categoría,
  TicketEstado,
} from "../../types";
import ClientService from "../../services/client-service";
import toast, { Toaster } from "react-hot-toast";
import ElementService from "../../services/element-service";
import TicketService from "../../services/ticket-service";
import { useNavigate } from "react-router-dom";
import SelectWithSearch from "../misc/select-with-search";
import Select from "../misc/select";
import { format } from "date-fns";
import MessageService from "../../services/message-service";
import session from "../../utils/session";
import permissions from "../../utils/permissions";
import MessageRender from "../../services/message-render-service";
import options from "../../utils/options";
import { useTicketSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import CategoryService from "../../services/category-service";
import MessageSenderService from "../../services/message-sender-service";
import clsx from "clsx";

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  ticket,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Ticket>(ticket!);
  const [selectedClient, _setSelectedClient] = useState<Selected>({
    value: ticket?.elemento?.cliente_id,
    label:
      ticket?.elemento?.cliente?.nombre +
      " " +
      ticket?.elemento?.cliente?.apellido,
  });
  const [selectedElement, _setSelectedElement] = useState<Selected>({
    value: ticket?.elemento_id,
    label: ticket?.elemento?.nombre,
  });
  const [selectedState, setSelectedState] = useState<Selected>({
    value: ticket?.estado,
    label: ticket?.estado === "ABIERTO" ? "Abierto" : "Cerrado",
  });

  const resetFormData = () => {
    setSelectedState({
      value: ticket?.estado,
      label: ticket?.estado === "ABIERTO" ? "Abierto" : "Cerrado",
    });
    setFormData(ticket!);
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
          ref.current?.close();
        }
      });
    } else {
      closeModal();
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect()!;
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-2/4 h-fit rounded shadow scrollbar-none text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar ticket</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando ticket...");
          TicketService.update(ticket?.id!, formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Ticket no pudo ser editado.");
            } else {
              toast.success("Ticket editado con exito.");
              if (options.find()?.creación.siempre) {
                const messageToast = toast.loading("Creando mensaje...");
                MessageRender.renderTicketModificationTemplate(
                  ticket?.id!,
                  ticket!
                ).then((rendered) => {
                  if (rendered) {
                    if (rendered === "Plantilla desactivada") {
                      toast.dismiss(messageToast);
                      toast.error("La plantilla esta desactivada.");
                      return;
                    }

                    const message: Mensaje = {
                      contenido: rendered,
                      ticket_id: ticket?.id!,
                      estado: "NO_ENVIADO",
                    };

                    MessageService.create(ticket?.id!, message).then(
                      (mensaje) => {
                        if (mensaje) {
                          toast.dismiss(messageToast);
                          toast.success("Mensaje creado exitosamente.");
                          TicketService.getById(ticket?.id!).then(
                            (resTicket) => {
                              if (resTicket) {
                                if (
                                  resTicket.elemento?.cliente?.enviarMensajes
                                ) {
                                  if (options.find()?.envio.siempre) {
                                    const sendingToast = toast.loading(
                                      "Enviando mensaje..."
                                    );
                                    MessageSenderService.send(
                                      resTicket.elemento?.cliente.telefono ||
                                        "",
                                      rendered
                                    ).then((res) => {
                                      if (res) {
                                        toast.dismiss(sendingToast);
                                        toast.success(
                                          "Mensaje enviado exitosamente."
                                        );
                                        MessageService.update(
                                          ticket?.id!,
                                          mensaje.id!,
                                          //@ts-ignore
                                          {
                                            id: mensaje.id!,
                                            estado: "ENVIADO",
                                            ticket_id: ticket?.id,
                                          }
                                        );
                                      } else {
                                        toast.dismiss(sendingToast);
                                        toast.error(
                                          "Mensaje no pudo ser enviado."
                                        );
                                      }
                                    });
                                  }
                                }
                              }
                            }
                          );
                        }
                      }
                    );
                  } else {
                    toast.dismiss(messageToast);
                    toast.error("Mensaje no pudo ser creado.");
                  }
                });
              }
            }
          });
        }}
      >
        {ticket?.estado === "ABIERTO" ? (
          <div className="relative">
            <Select
              onChange={() => {
                setFormData({
                  ...formData,
                  estado: selectedState.value as TicketEstado,
                  notas_de_cierre:
                    selectedState.value === "ABIERTO"
                      ? ""
                      : formData.notas_de_cierre,
                });
              }}
              options={[
                {
                  value: "ABIERTO",
                  label: "Abierto",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "CERRADO",
                  label: "Cerrado",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
              ]}
              selected={selectedState}
            />
          </div>
        ) : null}
        {ticket?.estado === "CERRADO" ? (
          <div className="relative">
            <select
              className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
              value={0}
              disabled={true}
            >
              <option value={0}>Cerrado</option>
            </select>
            <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
          </div>
        ) : null}
        <div className="relative">
          <select
            className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
            value={selectedClient.value}
            disabled={true}
          >
            <option value={selectedClient.value}>{selectedClient.label}</option>
          </select>
          <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
        </div>
        <div className="relative">
          <select
            className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
            value={selectedElement.value}
            disabled={true}
          >
            <option value={selectedElement.value}>
              {selectedElement.label}
            </option>
          </select>
          <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
        </div>
        <div className="flex gap-4">
          <div className="w-full">
            <textarea
              rows={4}
              placeholder="Notas de apertura"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  notas_de_apertura: e.target.value,
                });
              }}
              value={formData.notas_de_apertura}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={10}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 10 caracteres
            </span>
          </div>
          <div className="w-full">
            <textarea
              rows={4}
              placeholder="Notas de cierre"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  notas_de_cierre: e.target.value,
                });
              }}
              value={formData.notas_de_cierre}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={10}
              disabled={formData.estado === "ABIERTO"}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 10 caracteres
            </span>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              closeModal();
              resetFormData();
            }}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
            Completar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [elements, setElements] = useState<Elemento[]>([]);
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: -1,
    label: "Seleccionar cliente",
  });
  const [selectedElement, setSelectedElement] = useState<Selected>({
    value: -1,
    label: "Seleccionar elemento",
  });
  const [formData, setFormData] = useState<Ticket>({
    estado: "ABIERTO",
    notas_de_apertura: "",
    notas_de_cierre: "",
    elemento_id: -1,
  });

  const resetFormData = () => {
    setFormData({
      estado: "ABIERTO",
      elemento_id: -1,
      notas_de_apertura: "",
      notas_de_cierre: "",
    });
    setSelectedClient({
      value: -1,
      label: "Seleccionar cliente",
    });
    setSelectedElement({
      value: -1,
      label: "Seleccionar elemento",
    });
    setElements([]);
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
          ref.current?.close();
          resetFormData();
        }
      });
    } else {
      closeModal();
      ref.current?.close();
      resetFormData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (clients.length === 0) {
      setLoading(true);
      ClientService.getAll(1, 100).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setClients(data.rows);
          setLoading(false);
        }
      });
    } else {
      setLoading(true);
      setSelectedElement({
        value: -1,
        label: "Seleccionar elemento",
      });
      ElementService.getAll(selectedClient.value! as number, 1, 100).then(
        (data) => {
          if (data === false) {
            setLoading(false);
          } else {
            setElements(
              data.rows.filter((elemento) => elemento.estado === "INACTIVO")
            );
            setLoading(false);
          }
        }
      );
    }
  }, [selectedClient]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect()!;
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-2/5 h-fit max-h-[500px] rounded shadow scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadir ticket</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Añadiendo ticket...");
          TicketService.create(formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Ticket no pudo ser añadido.");
            } else {
              toast.success("Ticket añadido con exito.");
              if (options.find()?.creación.siempre) {
                const messageToast = toast.loading("Creando mensaje...");
                MessageRender.renderTicketCreationTemplate(data.id!).then(
                  (rendered) => {
                    if (rendered) {
                      if (rendered === "Plantilla desactivada") {
                        toast.dismiss(messageToast);
                        toast.error("La plantilla esta desactivada");
                        return;
                      }

                      const message: Mensaje = {
                        contenido: rendered,
                        ticket_id: data.id!,
                        estado: "NO_ENVIADO",
                      };

                      MessageService.create(data.id!, message).then(
                        (mensaje) => {
                          if (mensaje) {
                            toast.dismiss(messageToast);
                            toast.success("Mensaje creado exitosamente.");
                            TicketService.getById(data.id!).then((ticket) => {
                              if (ticket) {
                                if (ticket.elemento?.cliente?.enviarMensajes) {
                                  if (options.find()?.envio.siempre) {
                                    const sendingToast = toast.loading(
                                      "Enviando mensaje..."
                                    );
                                    MessageSenderService.send(
                                      ticket.elemento?.cliente.telefono || "",
                                      rendered
                                    ).then((res) => {
                                      if (res) {
                                        toast.dismiss(sendingToast);
                                        toast.success(
                                          "Mensaje enviado exitosamente."
                                        );
                                        MessageService.update(
                                          data.id!,
                                          mensaje.id!,
                                          //@ts-ignore
                                          {
                                            id: mensaje.id!,
                                            estado: "ENVIADO",
                                            ticket_id: data.id!,
                                          }
                                        );
                                      } else {
                                        toast.dismiss(sendingToast);
                                        toast.error(
                                          "Mensaje no pudo ser enviado."
                                        );
                                      }
                                    });
                                  }
                                }
                              }
                            });
                          }
                        }
                      );
                    } else {
                      toast.dismiss(messageToast);
                      toast.error("Mensaje no pudo ser creado.");
                    }
                  }
                );
              }
            }
          });
        }}
      >
        <div className="relative">
          {clients.length > 0 && (
            <SelectWithSearch
              options={clients.map((client) => ({
                value: client.id,
                label: `${client.nombre} ${client.apellido}${
                  client.documento ? "," : ""
                } ${client.documento ? client.documento : ""}`,
                onClick: (value, label) => {
                  setSelectedClient({
                    value,
                    label,
                  });
                },
              }))}
              selected={selectedClient}
            />
          )}
          {clients.length === 0 && loading === false && (
            <>
              <select
                className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                value={0}
                disabled={true}
              >
                <option value={0}>Seleccionar cliente</option>
              </select>
              <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
            </>
          )}
          {clients.length === 0 && loading === true && (
            <>
              <select
                className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                value={0}
                disabled={true}
              >
                <option value={0}>Buscando clientes...</option>
              </select>
              <svg
                aria-hidden="true"
                className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Cargando...</span>
            </>
          )}
        </div>
        {clients.length > 0 && elements.length > 0 && (
          <div className="relative">
            <SelectWithSearch
              onChange={() => {
                setFormData({
                  ...formData,
                  elemento_id: selectedElement.value! as number,
                });
              }}
              options={elements.map((element) => ({
                value: element.id,
                label: element.nombre,
                onClick: (value, label) => {
                  setSelectedElement({
                    value,
                    label,
                  });
                },
              }))}
              selected={selectedElement}
            />
          </div>
        )}
        {loading === false &&
        clients.length > 0 &&
        elements.length === 0 &&
        (selectedClient.value! as number) > 0 ? (
          <div className="relative">
            <select
              className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
              value={0}
              disabled={true}
            >
              <option value={0}>Seleccionar elemento</option>
            </select>
            <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
          </div>
        ) : null}
        {loading === true &&
        clients.length > 0 &&
        elements.length === 0 &&
        (selectedClient.value! as number) > 0 ? (
          <div className="relative">
            <select
              className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
              value={0}
              disabled={true}
            >
              <option value={0}>Buscando elementos...</option>
            </select>
            <svg
              aria-hidden="true"
              className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Cargando...</span>
          </div>
        ) : null}
        <div className="w-full">
          <textarea
            rows={3}
            placeholder="Notas de apertura"
            onChange={(e) => {
              setFormData({
                ...formData,
                notas_de_apertura: e.target.value,
              });
            }}
            value={formData.notas_de_apertura}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            minLength={10}
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 10 caracteres
          </span>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cancelar
          </button>
          <button
            className={clsx({
              ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                !selectedElement.label?.startsWith("Seleccionar"),
              ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                selectedElement.label?.startsWith("Seleccionar"),
            })}
          >
            Completar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DeleteModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  ticket,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
          ref.current?.close();
        }
      });
    } else {
      closeModal();
      ref.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect()!;
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-2/5 h-fit rounded-xl shadow text-base"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando ticket...");
          TicketService.delete(ticket?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Ticket eliminado con exito.");
              if (options.find()?.creación.siempre) {
                const messageToast = toast.loading("Creando mensaje...");
                MessageRender.renderTicketEliminationTemplate(ticket!).then(
                  (rendered) => {
                    if (rendered) {
                      if (rendered === "Plantilla desactivada") {
                        toast.dismiss(messageToast);
                        toast.error("La plantilla esta desactivada");
                        return;
                      }
                      toast.dismiss(messageToast);
                      toast.success("Mensaje creado exitosamente.");

                      if (ticket?.elemento?.cliente?.enviarMensajes) {
                        if (options.find()?.envio.siempre) {
                          const sendingToast = toast.loading(
                            "Enviando mensaje..."
                          );
                          MessageSenderService.send(
                            ticket?.elemento?.cliente.telefono || "",
                            rendered
                          ).then((res) => {
                            if (res) {
                              toast.dismiss(sendingToast);
                              toast.success("Mensaje enviado exitosamente.");
                            } else {
                              toast.dismiss(sendingToast);
                              toast.error("Mensaje no pudo ser enviado.");
                            }
                          });
                        }
                      }
                    } else {
                      toast.dismiss(messageToast);
                      toast.error("Mensaje no pudo ser creado.");
                    }
                  }
                );
              }
            } else {
              toast.error("Ticket no pudo ser eliminado.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        <div className="place-self-center  flex flex-col items-center">
          <Warning className="fill-red-400 h-16 w-16" />
          <p className="font-bold text-lg text-center mt-2">
            ¿Está seguro de que desea continuar?
          </p>
          <p className="font-medium text text-center mt-1">
            Los cambios provocados por esta acción son irreversibles.
          </p>
        </div>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={closeModal}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
            Completar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DataRow({ ticket, setOperationAsCompleted }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const [action, setAction] = useState<`${Action}`>(
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.editar.ticket
      ? "EDIT"
      : permissions.find()?.eliminar.ticket
      ? "DELETE"
      : permissions.find()?.ver.servicio
      ? "VIEW_SERVICES"
      : permissions.find()?.ver.problema
      ? "VIEW_PROBLEMS"
      : permissions.find()?.ver.mensaje
      ? "VIEW_MESSAGES"
      : "NONE"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
    permissions.find()?.editar.ticket
      ? true
      : permissions.find()?.eliminar.ticket
      ? true
      : permissions.find()?.ver.servicio
      ? true
      : permissions.find()?.ver.problema
      ? true
      : permissions.find()?.ver.mensaje
      ? true
      : false;

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  return (
    <tr>
      <th
        scope="row"
        className="px-6 py-3 font-medium text-[#2096ed] whitespace-nowrap border border-slate-300"
      >
        {ticket?.id}
      </th>
      <td className="px-6 py-2 border border-slate-300">
        {ticket?.estado === "ABIERTO" ? (
          <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-lg capitalize">
            Abierto
          </div>
        ) : (
          <div className="bg-gray-200 text-center text-gray-600 text-xs py-2 font-bold rounded-lg capitalize">
            Cerrado
          </div>
        )}
      </td>
      <td className="px-6 py-3 border border-slate-300">
        {ticket?.elemento?.cliente?.nombre}{" "}
        {ticket?.elemento?.cliente?.apellido}
      </td>
      <td className="px-6 py-3 border border-slate-300">
        {ticket?.elemento?.nombre}
      </td>
      <td className="px-6 py-3 border border-slate-300">
        {format(new Date(ticket?.creado!), "dd/MM/yyyy")}
      </td>
      <td className="px-6 py-3 border border-slate-300">
        {ticket?.cerrado
          ? format(new Date(ticket?.cerrado!), "dd/MM/yyyy")
          : "Nunca"}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 w-[200px] relative"
      >
        {action === "EDIT" && (
          <>
            <button
              onClick={() => {
                setIsEditOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar ticket
            </button>
            <EditModal
              ticket={ticket}
              isOpen={isEditOpen}
              closeModal={closeEditModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "DELETE" && (
          <>
            <button
              onClick={() => {
                setIsDeleteOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Eliminar ticket
            </button>
            <DeleteModal
              ticket={ticket}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "VIEW_SERVICES" && (
          <button
            onClick={() => {
              navigate(`/tickets/${ticket?.id}/servicios`);
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Servicios
          </button>
        )}
        {action === "VIEW_PROBLEMS" && (
          <button
            onClick={() => {
              navigate(`/tickets/${ticket?.id}/problemas`);
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Problemas
          </button>
        )}
        {action === "VIEW_MESSAGES" && (
          <button
            onClick={() => {
              navigate(`/tickets/${ticket?.id}/mensajes`);
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Mensajes
          </button>
        )}
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => {}}
            openSearchModal={() => {}}
            id={ticket?.id}
            top={
              ref?.current?.getBoundingClientRect().top! +
              window.scrollY +
              ref?.current?.getBoundingClientRect().height! -
              15
            }
            right={
              ref?.current?.getBoundingClientRect().left! + window.scrollX + 35
            }
          />
        )}
        {anyAction ? (
          <button
            id={`acciones-btn-${ticket?.id}`}
            className="bg-gray-300 border right-6 bottom-2.5 absolute hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
            onClick={() => setIsDropup(!isDropup)}
          >
            <More className="w-5 h-5 inline fill-black" />
          </button>
        ) : (
          <button className="font-medium line-through text-[#2096ed] dark:text-blue-500 -ml-2 py-1 px-2 rounded-lg cursor-default">
            Nada permitido
          </button>
        )}
      </td>
    </tr>
  );
}

function Dropup({ close, selectAction }: DropupProps) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        event.target.id !== "acciones-btn"
      ) {
        close();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <ul
      ref={ref}
      className="
          min-w-max
          absolute
          bg-white
          text-base
          z-50
          right-8
          top-14
          py-2
          list-none
          text-left
          rounded-lg
          shadow-lg
          mt-2
          m-0
          bg-clip-padding
          border
        "
    >
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.crear.ticket) && (
        <li>
          <div
            onClick={() => {
              selectAction("ADD");
              close();
            }}
            className="
              text-sm
              py-2
              px-4
              font-medium
              block
              w-full
              whitespace-nowrap
              bg-transparent
              text-slate-600
              hover:bg-slate-100
              cursor-pointer
            "
          >
            Añadir ticket
          </div>
        </li>
      )}
      <li>
        <div
          onClick={() => {
            selectAction("SEARCH");
            close();
          }}
          className="
              text-sm
              py-2
              px-4
              font-medium
              block
              w-full
              whitespace-nowrap
              bg-transparent
              text-slate-600
              hover:bg-slate-100
              cursor-pointer
            "
        >
          Buscar ticket
        </div>
      </li>
    </ul>
  );
}

function IndividualDropup({
  id,
  close,
  selectAction,
  top,
  right,
}: DropupProps) {
  const dropupRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropupRef.current &&
        !dropupRef.current.contains(event.target) &&
        event.target.id !== `acciones-btn-${id}`
      ) {
        close();
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
    <ul
      ref={dropupRef}
      className="
          min-w-max
          fixed
          bg-white
          text-base
          z-50
          py-2
          list-none
          text-left
          rounded-lg
          shadow-xl
          mt-2
          m-0
          bg-clip-padding
          border
        "
      style={{ top: top, left: right }}
    >
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.editar.ticket) && (
        <li>
          <div
            onClick={() => {
              selectAction("EDIT");
              close();
            }}
            className="
              text-sm
              py-2
              px-4
              font-medium
              block
              w-full
              whitespace-nowrap
              bg-transparent
              text-slate-600
              hover:bg-slate-100
              cursor-pointer
            "
          >
            Editar ticket
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.eliminar.ticket) && (
        <li>
          <div
            onClick={() => {
              selectAction("DELETE");
              close();
            }}
            className="
              text-sm
              py-2
              px-4
              font-medium
              block
              w-full
              whitespace-nowrap
              bg-transparent
              text-slate-600
              hover:bg-slate-100
              cursor-pointer
            "
          >
            Eliminar ticket
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        (permissions.find()?.editar.ticket &&
          permissions.find()?.eliminar.ticket)) && (
        <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.ver.servicio) && (
        <li>
          <div
            onClick={() => {
              selectAction("VIEW_SERVICES");
              close();
            }}
            className="
                text-sm
                py-2
                px-4
                font-medium
                block
                w-full
                whitespace-nowrap
                bg-transparent
                text-slate-600
                hover:bg-slate-100
                cursor-pointer
              "
          >
            Servicios
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.ver.problema) && (
        <li>
          <div
            onClick={() => {
              selectAction("VIEW_PROBLEMS");
              close();
            }}
            className="
                text-sm
                py-2
                px-4
                font-medium
                block
                w-full
                whitespace-nowrap
                bg-transparent
                text-slate-600
                hover:bg-slate-100
                cursor-pointer
              "
          >
            Problemas
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.ver.mensaje) && (
        <li>
          <div
            onClick={() => {
              selectAction("VIEW_MESSAGES");
              close();
            }}
            className="
                text-sm
                py-2
                px-4
                font-medium
                block
                w-full
                whitespace-nowrap
                bg-transparent
                text-slate-600
                hover:bg-slate-100
                cursor-pointer
              "
          >
            Mensajes
          </div>
        </li>
      )}
    </ul>
  );
}

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [categories, setCategories] = useState<Categoría[]>([]);
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: -1,
    label: "Seleccionar cliente",
  });
  const [selectedCategory, setSelectedCategory] = useState<Selected>({
    value: -1,
    label: "Seleccionar categoría",
  });
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const [selectedFecha, setSelectedFecha] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de busqueda",
  });
  const [selectedState, setSelectedState] = useState<Selected>({
    value: "",
    label: "Seleccionar estado de ticket",
  });
  const [selectedElement, setSelectedElement] = useState<Selected>({
    value: -1,
    label: "Seleccionar elemento",
  });
  const [elements, setElements] = useState<Elemento[]>([]);
  const tempInput = useTicketSearchParamStore((state) => state.tempInput);
  const secondTempInput = useTicketSearchParamStore(
    (state) => state.secondTempInput
  );
  const setInput = useTicketSearchParamStore((state) => state.setInput);
  const setTempInput = useTicketSearchParamStore((state) => state.setTempInput);
  const setSecondInput = useTicketSearchParamStore(
    (state) => state.setSecondInput
  );
  const setSecondTempInput = useTicketSearchParamStore(
    (state) => state.setSecondTempInput
  );
  const setParam = useTicketSearchParamStore((state) => state.setParam);
  const setSecondParam = useTicketSearchParamStore(
    (state) => state.setSecondParam
  );
  const setSearchId = useTicketSearchParamStore((state) => state.setSearchId);
  const incrementSearchCount = useTicketSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const [tempId, setTempId] = useState(0);

  const resetSearch = () => {
    setTempInput("");
    setSecondTempInput("");
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de busqueda",
    });
    setSelectedFecha({
      value: "",
      label: "Seleccionar tipo de busqueda",
    });
    setSelectedClient({
      value: -1,
      label: "Seleccionar cliente",
    });
    setSelectedElement({
      value: -1,
      label: "Seleccionar elemento",
    });
    setSelectedCategory({
      value: -1,
      label: "Seleccionar categoría",
    });
    setWasSearch(false);
    setTempId(0);
  };

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          resetSearch();
          closeModal();
          ref.current?.close();
        }
      });
    } else {
      resetSearch();
      closeModal();
      ref.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      selectedSearchType.value === "CLIENTE" ||
      selectedSearchType.value === "ELEMENTO"
    ) {
      if (clients.length === 0) {
        setLoading(true);
        ClientService.getAll(1, 100).then((data) => {
          if (data === false) {
            setLoading(false);
          } else {
            setClients(data.rows);
            setLoading(false);
          }
        });
      } else {
        setLoading(true);
        setSelectedElement({
          value: -1,
          label: "Seleccionar elemento",
        });
        ElementService.getAll(selectedClient.value! as number, 1, 100).then(
          (data) => {
            if (data === false) {
              setLoading(false);
            } else {
              setElements(data.rows);
              setLoading(false);
            }
          }
        );
      }
    } else if (selectedSearchType.value === "CATEGORÍA") {
      if (categories.length === 0) {
        setLoading(true);
        CategoryService.getByTipo("ELEMENTO", 1, 100).then((data) => {
          if (data === false) {
            setLoading(false);
          } else {
            setCategories(data.rows);
            setLoading(false);
          }
        });
      }
    }
  }, [selectedSearchType, selectedClient]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect()!;
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
          closeModal();
          ref.current?.close();
        }
      }}
      className="w-1/3 min-h-[200px] h-fit rounded-md shadow text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Buscar ticket</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          if (selectedSearchType.value !== "") {
            resetSearch();
            incrementSearchCount();
            closeModal();
            setWasSearch(true);
            setTempId(0);
          }
        }}
      >
        <div className="relative">
          <Select
            onChange={() => {
              setParam(selectedSearchType.value as string);
            }}
            options={[
              {
                value: "ID",
                label: "ID",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "ABIERTO",
                label: "Fecha de apertura",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "CERRADO",
                label: "Fecha de cierre",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "CLIENTE",
                label: "Cliente",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "ESTADO",
                label: "Estado",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "ELEMENTO",
                label: "Elemento",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "CATEGORÍA",
                label: "Categoría de elemento",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
            ]}
            selected={selectedSearchType}
          />
        </div>
        {selectedSearchType.value === "ID" ? (
          <input
            type="number"
            placeholder="Introduzca la ID del ticket"
            className="border p-2 rounded outline-none focus:border-[#2096ed]"
            onChange={(e) => {
              setTempId(Number(e.target));
              setSearchId(Number(e.target));
            }}
            value={tempId === 0 ? "" : tempId}
            min={1}
            required
          />
        ) : null}
        {selectedSearchType.value === "ESTADO" ? (
          <div className="relative">
            <Select
              onChange={() => {
                setInput(selectedState.value as string);
                setSecondParam(selectedSearchType.value as string);
              }}
              options={[
                {
                  value: "ABIERTO",
                  label: "Abierto",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "CERRADO",
                  label: "Cerrado",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
              ]}
              selected={selectedState}
            />
          </div>
        ) : null}
        {selectedSearchType.value === "CATEGORÍA" ? (
          <>
            <div className="relative">
              {categories.length > 0 && (
                <SelectWithSearch
                  options={categories.map((category) => ({
                    value: category.id,
                    label: `${category.nombre}`,
                    onClick: (value, label) => {
                      setSelectedCategory({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedCategory}
                  onChange={() => {
                    setSearchId(selectedCategory.value as number);
                  }}
                />
              )}
              {categories.length === 0 && loading === false && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Seleccionar categoría</option>
                  </select>
                  <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
                </>
              )}
              {categories.length === 0 && loading === true && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Buscando categorías...</option>
                  </select>
                  <svg
                    aria-hidden="true"
                    className="inline w-4 h-4 mr-2 text-blue-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Cargando...</span>
                </>
              )}
            </div>
          </>
        ) : null}
        {selectedSearchType.value === "CLIENTE" ? (
          <>
            <div className="relative">
              {clients.length > 0 && (
                <SelectWithSearch
                  options={clients.map((client) => ({
                    value: client.id,
                    label: `${client.nombre} ${client.apellido}${
                      client.documento ? "," : ""
                    } ${client.documento ? client.documento : ""}`,
                    onClick: (value, label) => {
                      setSelectedClient({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedClient}
                  onChange={() => {
                    setSearchId(selectedClient.value as number);
                  }}
                />
              )}
              {clients.length === 0 && loading === false && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Seleccionar cliente</option>
                  </select>
                  <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
                </>
              )}
              {clients.length === 0 && loading === true && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Buscando clientes...</option>
                  </select>
                  <svg
                    aria-hidden="true"
                    className="inline w-4 h-4 mr-2 text-blue-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Cargando...</span>
                </>
              )}
            </div>
          </>
        ) : null}
        {selectedSearchType.value === "ABIERTO" ||
        selectedSearchType.value === "CERRADO" ? (
          <div className="relative">
            <Select
              onChange={() => {
                setSecondParam(selectedFecha.value as string);
              }}
              options={[
                {
                  value: "HOY",
                  label: "Hoy",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "RECIENTEMENTE",
                  label: "Recientemente",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "ESTA_SEMANA",
                  label: "Esta semana",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "ESTE_MES",
                  label: "Este mes",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "ESTE_AÑO",
                  label: "Este año",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "ENTRE",
                  label: "Entre las fechas",
                  onClick: (value, label) => {
                    setSelectedFecha({
                      value,
                      label,
                    });
                  },
                },
              ]}
              selected={selectedFecha}
            />
          </div>
        ) : null}
        {selectedFecha.value === "ENTRE" &&
        (selectedSearchType.value === "ABIERTO" ||
          selectedSearchType.value === "CERRADO") ? (
          <>
            {" "}
            <input
              type="date"
              placeholder="Fecha inicial"
              value={tempInput}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                setInput(e.target.value);
                setTempInput(e.target.value);
              }}
              required
            />
            <input
              type="date"
              placeholder="Fecha final"
              value={secondTempInput}
              className="border p-2 rounded outline-none focus:border-[#2096ed]"
              onChange={(e) => {
                setSecondInput(e.target.value);
                setSecondTempInput(e.target.value);
              }}
              required
            />
          </>
        ) : null}
        {selectedSearchType.value === "ELEMENTO" ? (
          <>
            <div className="relative">
              {clients.length > 0 && (
                <SelectWithSearch
                  options={clients.map((client) => ({
                    value: client.id,
                    label: `${client.nombre} ${client.apellido}${
                      client.documento ? "," : ""
                    } ${client.documento ? client.documento : ""}`,
                    onClick: (value, label) => {
                      setSelectedClient({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedClient}
                />
              )}
              {clients.length === 0 && loading === false && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Seleccionar cliente</option>
                  </select>
                  <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
                </>
              )}
              {clients.length === 0 && loading === true && (
                <>
                  <select
                    className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                    value={0}
                    disabled={true}
                  >
                    <option value={0}>Buscando clientes...</option>
                  </select>
                  <svg
                    aria-hidden="true"
                    className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Cargando...</span>
                </>
              )}
            </div>
            {clients.length > 0 && elements.length > 0 && (
              <div className="relative">
                <SelectWithSearch
                  onChange={() => {
                    setSearchId(Number(selectedElement.value!));
                  }}
                  options={elements.map((element) => ({
                    value: element.id,
                    label: element.nombre,
                    onClick: (value, label) => {
                      setSelectedElement({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedElement}
                />
              </div>
            )}
            {loading === false &&
            clients.length > 0 &&
            elements.length === 0 &&
            (selectedClient.value! as number) > 0 ? (
              <div className="relative">
                <select
                  className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                  value={0}
                  disabled={true}
                >
                  <option value={0}>Seleccionar elemento</option>
                </select>
                <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
              </div>
            ) : null}
            {loading === true &&
            clients.length > 0 &&
            elements.length === 0 &&
            (selectedClient.value! as number) > 0 ? (
              <div className="relative">
                <select
                  className="select-none border w-full p-2 rounded outline-none appearance-none text-slate-600 font-medium border-slate-300"
                  value={0}
                  disabled={true}
                >
                  <option value={0}>Buscando elementos...</option>
                </select>
                <svg
                  aria-hidden="true"
                  className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-3 right-4 absolute"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Cargando...</span>
              </div>
            ) : null}
          </>
        ) : null}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              closeModal();
              resetSearch();
            }}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cancelar
          </button>
          <button
            className={clsx({
              ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                selectedSearchType.label?.startsWith("Seleccionar") ||
                (selectedFecha.label?.startsWith("Seleccionar") &&
                  //@ts-ignore
                  selectedSearchType?.value?.includes("Fecha")) ||
                (selectedState.label?.startsWith("Seleccionar") &&
                  selectedSearchType?.value === "ESTADO") ||
                (selectedCategory.label?.startsWith("Seleccionar") &&
                  selectedSearchType?.value === "CATEGORÍA") ||
                (selectedClient.label?.startsWith("Seleccionar") &&
                  selectedSearchType?.value === "CLIENTE") ||
                ((selectedClient.label?.startsWith("Seleccionar") ||
                  selectedElement.label?.startsWith("Seleccionar")) &&
                  selectedSearchType?.value === "ELEMENTO"),
              ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                true,
            })}
          >
            Buscar
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default function TicketDataDisplay() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.crear.ticket
      ? "ADD"
      : "SEARCH"
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useTicketSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useTicketSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useTicketSearchParamStore((state) => state.input);
  const param = useTicketSearchParamStore((state) => state.param);
  const searchId = useTicketSearchParamStore((state) => state.searchId);
  const secondInput = useTicketSearchParamStore((state) => state.secondInput);
  const secondParam = useTicketSearchParamStore((state) => state.secondParam);
  const [isSearch, setIsSearch] = useState(false);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);

  const openAddModal = () => {
    setIsAddOpen(true);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
  };

  const closeDropup = () => {
    setIsDropup(false);
  };

  const setAsCompleted = () => {
    setIsOperationCompleted(true);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  useEffect(() => {
    if (searchCount === 0) {
      TicketService.getAll(page, 8).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          setTickets([]);
          resetSearchCount();
          setWasSearch(false);
        } else {
          setTickets(data.rows);
          setPages(data.pages);
          setCurrent(data.current);
          setLoading(false);
          setNotFound(false);
          resetSearchCount();
          setWasSearch(false);
        }
        setIsOperationCompleted(false);
      });
    } else {
      if (param === "CERRADO" || (param === "ABIERTO" && wasSearch)) {
        const loadingToast = toast.loading("Buscando...");
        if (secondParam === "HOY") {
          TicketService.getToday(param, page, 8).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setTickets([]);
            } else {
              setTickets(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "RECIENTEMENTE") {
          TicketService.getRecent(param, page, 8).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setTickets([]);
            } else {
              setTickets(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTA_SEMANA") {
          TicketService.getThisWeek(param, page, 8).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setTickets([]);
            } else {
              setTickets(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_MES") {
          TicketService.getThisMonth(param, page, 8).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setTickets([]);
            } else {
              setTickets(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ESTE_AÑO") {
          TicketService.getThisYear(param, page, 8).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setTickets([]);
            } else {
              setTickets(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            setIsOperationCompleted(false);
          });
        } else if (secondParam === "ENTRE") {
          if (param === "ABIERTO") {
            TicketService.getOpenBetween(
              new Date(input).toISOString().split("T")[0],
              new Date(secondInput).toISOString().split("T")[0],
              page,
              8
            ).then((data) => {
              if (data === false) {
                setNotFound(true);
                setLoading(false);
                setTickets([]);
              } else {
                setTickets(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              toast.dismiss(loadingToast);
              setIsOperationCompleted(false);
            });
          } else {
            TicketService.getClosedBetween(
              new Date(input).toISOString().split("T")[0],
              new Date(secondInput).toISOString().split("T")[0],
              page,
              8
            ).then((data) => {
              if (data === false) {
                setNotFound(true);
                setLoading(false);
                setTickets([]);
              } else {
                setTickets(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              toast.dismiss(loadingToast);
              setIsOperationCompleted(false);
            });
          }
        }
      } else if (param === "CLIENTE" && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        TicketService.getByClient(searchId, page, 8).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setTickets([]);
          } else {
            setTickets(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
            setNotFound(false);
          }
          toast.dismiss(loadingToast);
          setIsOperationCompleted(false);
        });
      } else if (param === "CATEGORÍA" && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        TicketService.getByCategory(searchId, page, 8).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setTickets([]);
          } else {
            setTickets(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
            setNotFound(false);
          }
          toast.dismiss(loadingToast);
          setIsOperationCompleted(false);
        });
      } else if (param === "ESTADO" && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        TicketService.getByState(input, page, 8).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setTickets([]);
          } else {
            setTickets(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
            setNotFound(false);
          }
          toast.dismiss(loadingToast);
          setIsOperationCompleted(false);
        });
      } else if (param === "ID" && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        TicketService.getById(searchId).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setTickets([]);
            resetSearchCount();
            setWasSearch(false);
          } else {
            setTickets([data]);
            setPages(1);
            setCurrent(1);
            setLoading(false);
            setNotFound(false);
            resetSearchCount();
            setWasSearch(false);
          }
          toast.dismiss(loadingToast);
          setIsOperationCompleted(false);
        });
      } else if (param === "ELEMENTO" && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        TicketService.getByElemento(searchId, page, 8).then((data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setTickets([]);
            resetSearchCount();
            setWasSearch(false);
          } else {
            setTickets(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
            setNotFound(false);
          }
          toast.dismiss(loadingToast);
          setIsOperationCompleted(false);
        });
      }
    }
  }, [isOperationCompleted, searchCount, page]);

  useEffect(() => {
    setPage(1);
  }, [searchCount]);

  return (
    <>
      <div className="absolute w-full h-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">Tickets</span>
          </div>
          <div className="flex gap-2">
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={() => {}}
                openSearchModal={() => {}}
              />
            )}
            {action === "ADD" ? (
              <button
                onClick={openAddModal}
                className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
              >
                Añadir ticket
              </button>
            ) : null}
            {action === "SEARCH" ? (
              <>
                {searchCount > 0 ? (
                  <button
                    type="button"
                    onClick={resetSearchCount}
                    className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                  >
                    Cancelar busqueda
                  </button>
                ) : null}
                <button
                  onClick={() => setIsSearch(true)}
                  className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                >
                  Buscar ticket
                </button>
              </>
            ) : null}
            <button
              id="acciones-btn"
              onClick={() => {
                setIsDropup(!isDropup);
              }}
              className="bg-gray-300 border hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
            >
              <More className="w-5 h-5 inline fill-black" />
            </button>
          </div>
        </nav>
        <hr className="border-1 border-slate-300 my-5" />
        {tickets.length > 0 && loading == false && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left border border-slate-300">
              <thead className="text-xs bg-[#2096ed] uppercase text-white">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 border border-slate-300 text-center"
                  >
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Elemento
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Creado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Cerrado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  return (
                    <DataRow
                      action={""}
                      ticket={ticket}
                      setOperationAsCompleted={setAsCompleted}
                      key={ticket.id}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true || (tickets.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún ticket encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningún ticket registrado."
                  : "Esto puede deberse a un error del servidor, o a que ningún ticket concuerda con tu busqueda"}
              </p>
            </div>
          </div>
        )}
        {loading === true && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-14 h-14 mr-2 text-blue-200 animate-spin dark:text-gray-600 fill-[#2096ed]"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Cargando...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {tickets.length > 0 && loading == false && (
        <Pagination
          pages={pages}
          current={current}
          next={() => {
            if (current < pages && current !== pages) {
              setPage(page + 1);
            }
          }}
          prev={() => {
            if (current > 1) {
              setPage(page - 1);
            }
          }}
        />
      )}
      <Toaster position="bottom-right" reverseOrder={false} />
      <AddModal
        isOpen={isAddOpen}
        closeModal={closeAddModal}
        setOperationAsCompleted={setAsCompleted}
      />
      <SearchModal
        isOpen={isSearch}
        closeModal={() => setIsSearch(false)}
        setOperationAsCompleted={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
}
