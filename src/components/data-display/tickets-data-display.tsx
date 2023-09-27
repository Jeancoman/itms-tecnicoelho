import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
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
  TicketTipo,
  Mensaje,
} from "../../types";
import ClientService from "../../services/client-service";
import toast, { Toaster } from "react-hot-toast";
import ElementService from "../../services/element-service";
import TicketService from "../../services/ticket-service";
import { useNavigate } from "react-router-dom";
import Select from "../misc/select";
import { format } from "date-fns";
import TemplateService from "../../services/template-service";
import TemplatingEngine from "../../engine/templating-engine";
import MessageService from "../../services/message-service";
import session from "../../utils/session";
import permissions from "../../utils/permissions";

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
  const [selectedType, setSelectedType] = useState<Selected>({
    label:
      ticket?.tipo === "DOMICILIO"
        ? "Domicilio"
        : ticket?.tipo === "TIENDA"
        ? "Tienda"
        : "Remoto",
    value: ticket?.tipo,
  });

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
      className="w-2/5 h-fit rounded shadow scrollbar-none text-base"
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
            }
          });
        }}
      >
        <div className="relative">
          <Select
            onChange={() => {
              setFormData({
                ...formData,
                tipo: selectedType.value as TicketTipo,
              });
            }}
            options={[
              {
                value: "DOMICILIO",
                label: "Domicilio",
                onClick: (value, label) => {
                  setSelectedType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "TIENDA",
                label: "Tienda",
                onClick: (value, label) => {
                  setSelectedType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "REMOTO",
                label: "Remoto",
                onClick: (value, label) => {
                  setSelectedType({
                    value,
                    label,
                  });
                },
              },
            ]}
            selected={selectedType}
          />
        </div>
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
        <div className="flex gap-2 justify-end">
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
  const [selectedType, setSelectedType] = useState<Selected>({
    label: "Seleccionar tipo",
    value: "",
  });
  const [formData, setFormData] = useState<Ticket>({
    tipo: "TIENDA",
    estado: "ABIERTO",
    elemento_id: -1,
  });

  const resetFormData = () => {
    setFormData({
      tipo: "TIENDA",
      estado: "ABIERTO",
      elemento_id: -1,
    });
    setSelectedClient({
      value: -1,
      label: "Seleccionar cliente",
    });
    setSelectedElement({
      value: -1,
      label: "Seleccionar elemento",
    });
    setSelectedType({ label: "Seleccionar tipo", value: "" });
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
  }, [selectedClient]);

  const renderTemplate = async (ticket_id: number) => {
    const template = await TemplateService.getById(1);

    if (template === false) {
      return false;
    } else if (!template.estaActiva) {
      return;
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
    });

    return engine.start();
  };

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
        <h1 className="text-xl font-bold text-white">Crear ticket</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Creando ticket...");
          TicketService.create(formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Ticket no pudo ser creado.");
            } else {
              toast.success("Ticket creado con exito.");
              const messageToast = toast.loading("Creando mensaje...");
              renderTemplate(data.id!).then((rendered) => {
                if (rendered) {
                  const message: Mensaje = {
                    contenido: rendered,
                    ticket_id: data.id!,
                    estado: "NO_ENVIADO",
                  };
                  MessageService.create(data.id!, message).then((data) => {
                    if (data) {
                      toast.dismiss(messageToast);
                      toast.success("Mensaje creado exitosamente.");
                    }
                  });
                } else {
                  toast.dismiss(messageToast);
                  toast.error("Mensaje no pudo ser creado.");
                }
              });
            }
          });
        }}
      >
        <div className="relative">
          <Select
            onChange={() => {
              setFormData({
                ...formData,
                tipo: selectedType.value as TicketTipo,
              });
            }}
            options={[
              {
                value: "DOMICILIO",
                label: "Domicilio",
                onClick: (value, label) => {
                  setSelectedType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "TIENDA",
                label: "Tienda",
                onClick: (value, label) => {
                  setSelectedType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "REMOTO",
                label: "Remoto",
                onClick: (value, label) => {
                  setSelectedType({
                    value,
                    label,
                  });
                },
              },
            ]}
            selected={selectedType}
          />
        </div>
        <div className="relative">
          {clients.length > 0 && (
            <Select
              options={clients.map((client) => ({
                value: client.id,
                label: client.nombre + " " + client.apellido,
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
        <div className="relative">
          {clients.length > 0 && elements.length > 0 && (
            <Select
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
          )}
          {loading === false &&
          clients.length > 0 &&
          elements.length === 0 &&
          (selectedClient.value! as number) > 0 ? (
            <>
              <select
                className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                value={0}
                disabled={true}
              >
                <option value={0}>Seleccionar elemento</option>
              </select>
              <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
            </>
          ) : null}
          {loading === true &&
          clients.length > 0 &&
          elements.length === 0 &&
          (selectedClient.value! as number) > 0 ? (
            <>
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
            </>
          ) : null}
        </div>
        <div className="flex gap-2 justify-end">
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

function DataRow({ action, ticket, setOperationAsCompleted }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
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
      <td className="px-6 py-3 border border-slate-300 w-[200px]">
        {action === "NONE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 italic cursor-not-allowed">
            Ninguna seleccionada
          </button>
        )}
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
            Mostrar servicios
          </button>
        )}
        {action === "VIEW_PROBLEMS" && (
          <button
            onClick={() => {
              navigate(`/tickets/${ticket?.id}/problemas`);
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Mostrar problemas
          </button>
        )}
        {action === "VIEW_MESSAGES" && (
          <button
            onClick={() => {
              navigate(`/tickets/${ticket?.id}/mensajes`);
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Mostrar mensajes
          </button>
        )}
      </td>
    </tr>
  );
}

function Dropup({ close, selectAction, openAddModal }: DropupProps) {
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
      {session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.editar.ticket && (
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
      {session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.eliminar.ticket && (
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
      {session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.editar.ticket &&
        permissions.find()?.eliminar.ticket && (
          <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
        )}
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
          Mostrar servicios
        </div>
      </li>
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
          Mostrar problemas
        </div>
      </li>
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
          Mostrar mensajes
        </div>
      </li>
      <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      {session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.crear.ticket && (
          <li>
            <div
              onClick={() => {
                openAddModal();
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
              Crear ticket
            </div>
          </li>
        )}
      <li>
        <div
          onClick={() => {
            openAddModal();
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
          Hacer consulta
        </div>
      </li>
    </ul>
  );
}

export default function TicketDataDisplay() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>("NONE");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);

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
    if (isOperationCompleted) {
      setNotFound(false);
      setLoading(true);
    }
    TicketService.getAll(page, 8).then((data) => {
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
  }, [isOperationCompleted, page]);

  return (
    <>
      <div className="absolute w-full h-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menu <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className=" text-[#2096ed]">Tickets</span>
          </div>
          <div>
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={openAddModal}
              />
            )}
            <button
              id="acciones-btn"
              onClick={() => {
                setIsDropup(!isDropup);
              }}
              className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
            >
              Acciones
              <Down className="ml-2 mb-0.5 w-3 h-3 inline fill-white" />
            </button>
          </div>
        </nav>
        <hr className="border-1 border-slate-300 my-5" />
        {tickets.length > 0 && loading == false && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left border border-slate-300">
              <thead className="text-xs bg-[#2096ed] uppercase text-white">
                <tr>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
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
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  return (
                    <DataRow
                      action={action}
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
        {notFound === true && (
          <div className="grid w-full h-4/5 text-slate-600">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún ticket encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                Esto puede deberse a un error del servidor, o a que simplemente
                no hay ningún ticket registrado.
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
    </>
  );
}
