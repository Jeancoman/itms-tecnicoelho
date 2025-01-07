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
  Selected,
  Mensaje,
  Categoría,
  TicketPrioridad,
  ServicioTipo,
  TicketEstado,
} from "../../types";
import ClientService from "../../services/client-service";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectWithSearch from "../misc/select-with-search";
import Select from "../misc/select";
import { format } from "date-fns";
import MessageService from "../../services/message-service";
import permissions from "../../utils/permissions";
import MessageRender from "../../services/message-render-service";
import options from "../../utils/options";
import { useTicketSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import CategoryService from "../../services/category-service";
import MessageSenderService from "../../services/message-sender-service";
import clsx from "clsx";
import TicketService from "../../services/ticket-service";
import { Editor } from "@tinymce/tinymce-react";

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  ticket,
}: ModalProps) {
  const [loading, setLoading] = useState(true);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [categories, setCategories] = useState<Categoría[]>([]);
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: ticket?.cliente_id || -1,
    label: `${ticket?.cliente?.nombre ?? ""} ${
      ticket?.cliente?.apellido ?? ""
    }${ticket?.cliente?.documento ? `, ${ticket?.cliente?.documento}` : ""}`,
  });
  const [selectedPriority, setSelectedPriority] = useState<Selected>({
    value: ticket?.prioridad || "BAJA",
    label:
      ticket?.prioridad === "ALTA"
        ? "Alta"
        : ticket?.prioridad === "MEDIA"
        ? "Media"
        : "Baja",
  });
  const [ticketFormData, setTicketFormData] = useState<Ticket>(ticket!);
  const [selectedCategory, setSelectedCategory] = useState<Selected>({
    value: ticket?.categoría_id || -1,
    label: ticket?.categoría?.nombre || "Seleccionar categoría",
  });
  const [selectedType, setSelectedType] = useState<Selected>({
    value: ticket?.tipo || "TIENDA",
    label: {
      DOMICILIO: "Domicilio",
      REMOTO: "Remoto",
      TIENDA: "Tienda",
    }[ticket?.tipo || "TIENDA"],
  });
  const [selectedState, setSelectedState] = useState<Selected>({
    value: ticket?.estado,
    label: ticket?.estado === "ABIERTO" ? "Abierto" : "Cerrado",
  });
  const [showFullDescription, setShowFullDescription] = useState(false);

  const resetFormData = () => {
    setTicketFormData(ticket!);
    setSelectedClient({
      value: ticket?.cliente_id || -1,
      label: `${ticket?.cliente?.nombre ?? ""} ${
        ticket?.cliente?.apellido ?? ""
      }${ticket?.cliente?.documento ? `, ${ticket?.cliente?.documento}` : ""}`,
    });
    setSelectedPriority({
      value: ticket?.prioridad || "BAJA",
      label:
        ticket?.prioridad === "ALTA"
          ? "Alta"
          : ticket?.prioridad === "MEDIA"
          ? "Media"
          : "Baja",
    });
    setSelectedCategory({
      value: ticket?.categoría_id || -1,
      label:
        ticket?.categoría?.nombre || "Selecciona la categoría del servicio",
    });
    setSelectedType({
      value: ticket?.tipo || "TIENDA",
      label: {
        DOMICILIO: "Domicilio",
        REMOTO: "Remoto",
        TIENDA: "Tienda",
      }[ticket?.tipo || "TIENDA"],
    });
    setSelectedState({
      value: ticket?.estado,
      label: ticket?.estado === "ABIERTO" ? "Abierto" : "Cerrado",
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Previene el scroll en el fondo
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (clients.length === 0) {
      setLoading(true);
      void loadClients();
    }
  }, [clients.length]);

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(true);
      void loadCategories();
    }
  }, [categories.length]);

  const handleClose = () => {
    closeModal();
    resetFormData();
    setIsConfirmationScreen(false);
  };

  const handleButtonClose = () => {
    closeModal();
    resetFormData();
    setIsConfirmationScreen(false);
  };

  const loadClients = async () => {
    const data = await ClientService.getAll(1, 100);
    if (data === false) {
      setLoading(false);
    } else {
      setClients(data.rows);
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const data = await CategoryService.getAll(1, 100);
    if (data === false) {
      setLoading(false);
    } else {
      setCategories(data.rows);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();

    const loadingToast = toast.loading("Editando ticket...");
    const updatedTicket = await TicketService.update(
      ticketFormData.id!,
      ticketFormData
    );

    toast.dismiss(loadingToast);
    setOperationAsCompleted();

    if (updatedTicket.status === "error") {
      toast.error(updatedTicket.message);
      return;
    }

    toast.success(updatedTicket.message);

    if (options.find()?.creación.siempre) {
      await handleCreateMessage(ticket!);
    }
  };

  const handleCreateMessage = async (ticket: Ticket) => {
    const messageToast = toast.loading("Creando mensaje...");
    const rendered = await MessageRender.renderTicketModificationTemplate(
      ticket.id!,
      ticket
    );

    if (!rendered || rendered === "Plantilla desactivada") {
      toast.dismiss(messageToast);
      toast.error(
        rendered
          ? "La plantilla está desactivada"
          : "El mensaje no pudo ser creado."
      );
      return;
    }

    const message: Mensaje = {
      contenido: rendered,
      servicio_id: ticket.id!,
      estado: "NO_ENVIADO",
    };

    const response = await MessageService.create(ticket.id!, message);

    if (response.status === "success") {
      toast.dismiss(messageToast);
      toast.success(response.message);
      await handleSendMessage(ticket, rendered, response.mensaje!);
    } else {
      toast.dismiss(messageToast);
      toast.error(response.message);
    }
  };

  const handleSendMessage = async (
    ticket: Ticket,
    rendered: string,
    mensaje: Mensaje
  ) => {
    if (ticket.cliente?.enviarMensajes && options.find()?.envio.siempre) {
      const sendingToast = toast.loading("Enviando mensaje...");
      const res = await MessageSenderService.send(
        ticket.cliente.telefono || "",
        rendered
      );

      if (res) {
        toast.dismiss(sendingToast);
        toast.success("El mensaje fue enviado exitosamente.");
        await updateMessageStatus(ticket.id!, mensaje.id!, mensaje.contenido);
      } else {
        toast.dismiss(sendingToast);
        toast.error("El mensaje no pudo ser enviado.");
      }
    }
  };

  const updateMessageStatus = async (
    ticketId: number,
    messageId: number,
    contenido: string
  ) => {
    await MessageService.update(ticketId, messageId, {
      id: messageId,
      estado: "ENVIADO",
      contenido,
      servicio_id: ticketId,
    });
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  if (!isOpen) {
    return null;
  }

  const renderConfirmationScreen = () => {
    const toggleDescription = () => {
      setShowFullDescription((prev) => !prev);
    };

    return (
      <div className="p-8 pt-6">
        <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Datos actuales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Datos actuales
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Estado
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {capitalizeFirstLetter(ticket?.estado || "")}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Asunto
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {ticket?.asunto}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Prioridad
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {ticket?.prioridad
                      ? capitalizeFirstLetter(ticket.prioridad)
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Tipo
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {ticket?.tipo ? capitalizeFirstLetter(ticket.tipo) : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Categoría
                  </p>
                  <p className="text-gray-900 font-medium text-base break-words">
                    {ticket?.categoría?.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Descripción
                  </p>
                  <div
                    className={`text-gray-900 font-medium text-base break-words p-2 border rounded ${
                      showFullDescription
                        ? "max-h-80 overflow-y-auto"
                        : "max-h-40 overflow-hidden"
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: ticket?.descripción ?? "",
                      }}
                    />
                  </div>
                  {(ticket?.descripción?.length ?? 0) > 200 && (
                    <button
                      type="button"
                      onClick={toggleDescription}
                      className="text-blue-500 mt-2"
                    >
                      {showFullDescription ? "Ver Menos" : "Ver Más"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Nuevos datos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Nuevos datos
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Estado
                  </p>
                  <p
                    className={`text-base font-medium break-words ${
                      selectedState.value !== ticket?.estado
                        ? "text-blue-600 font-semibold"
                        : "text-gray-900"
                    }`}
                  >
                    {selectedState.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Asunto
                  </p>
                  <p
                    className={`text-base font-medium break-words ${
                      ticketFormData.asunto !== ticket?.asunto
                        ? "text-blue-600 font-semibold"
                        : "text-gray-900"
                    }`}
                  >
                    {ticketFormData.asunto}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Prioridad
                  </p>
                  <p
                    className={`text-base font-medium break-words ${
                      ticketFormData.prioridad !== ticket?.prioridad
                        ? "text-blue-600 font-semibold"
                        : "text-gray-900"
                    }`}
                  >
                    {selectedPriority.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Tipo
                  </p>
                  <p
                    className={`text-base font-medium break-words ${
                      ticketFormData.tipo !== ticket?.tipo
                        ? "text-blue-600 font-semibold"
                        : "text-gray-900"
                    }`}
                  >
                    {selectedType.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Categoría
                  </p>
                  <p
                    className={`text-base font-medium break-words ${
                      ticketFormData.categoría_id !== ticket?.categoría_id
                        ? "text-blue-600 font-semibold"
                        : "text-gray-900"
                    }`}
                  >
                    {selectedCategory.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                    Descripción
                  </p>
                  <div
                    className={`text-gray-900 font-medium text-base break-words p-2 border rounded ${
                      showFullDescription
                        ? "max-h-80 overflow-y-auto"
                        : "max-h-40 overflow-hidden"
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: ticketFormData.descripción ?? "",
                      }}
                    />
                  </div>
                  {(ticketFormData.descripción?.length ?? 0) > 200 && (
                    <button
                      type="button"
                      onClick={toggleDescription}
                      className="text-blue-500 mt-2"
                    >
                      {showFullDescription ? "Ver Menos" : "Ver Más"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2 justify-end text-base">
          <button
            type="button"
            onClick={() => setIsConfirmationScreen(false)}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Volver
          </button>
          <button
            onClick={handleFinalSubmit}
            className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10"
      onClick={handleClose}
    >
      <div
        className="bg-white w-max max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow relative max-h-[650px] overflow-y-scroll scrollbar-thin"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal cierre el mismo
      >
        <div className="bg-[#2096ed] py-3 md:py-4 px-6 md:px-8 rounded-t">
          <h1 className="text-lg md:text-xl font-bold text-white">
            Editar ticket
          </h1>
        </div>
        {isConfirmationScreen ? (
          renderConfirmationScreen()
        ) : (
          <form
            className="flex flex-col p-8 pt-6 gap-4 group text-base"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            {ticket?.estado === "ABIERTO" ? (
              <div className="relative">
                <label className="block text-gray-600 text-base font-medium mb-2">
                  Estado
                </label>
                <Select
                  onChange={() => {
                    setTicketFormData({
                      ...ticketFormData,
                      estado: selectedState.value as TicketEstado,
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
                <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
              </div>
            ) : null}
            <div className="w-full">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Asunto*
              </label>
              <input
                type="text"
                onChange={(e) => {
                  setTicketFormData({
                    ...ticketFormData,
                    asunto: e.target.value,
                  });
                }}
                value={ticketFormData.asunto}
                placeholder="Introducir asunto"
                className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                pattern="^.{2,}$"
                name="name"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Mínimo 2 caracteres
              </span>
            </div>
            <div className="relative">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Prioridad*
              </label>
              <Select
                onChange={() => {
                  setTicketFormData({
                    ...ticketFormData,
                    prioridad: selectedPriority.value as TicketPrioridad,
                  });
                }}
                options={[
                  {
                    value: "BAJA",
                    label: "Baja",
                    onClick: (value, label) => {
                      setSelectedPriority({
                        value,
                        label,
                      });
                    },
                  },
                  {
                    value: "MEDIA",
                    label: "Media",
                    onClick: (value, label) => {
                      setSelectedPriority({
                        value,
                        label,
                      });
                    },
                  },
                  {
                    value: "ALTA",
                    label: "Alta",
                    onClick: (value, label) => {
                      setSelectedPriority({
                        value,
                        label,
                      });
                    },
                  },
                ]}
                selected={selectedPriority}
              />
            </div>
            <div className="relative">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Cliente*
              </label>
              <select
                className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                value={selectedClient.value}
                disabled={true}
              >
                <option value={selectedType.value}>{`${
                  ticket?.cliente?.nombre
                } ${ticket?.cliente?.apellido}${
                  ticket?.cliente?.documento ? "," : ""
                } ${
                  ticket?.cliente?.documento ? ticket?.cliente?.documento : ""
                }`}</option>
              </select>
              <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
            </div>
            <div className="flex gap-2">
              <div className="relative w-2/4">
                <label className="block text-gray-600 text-base font-medium mb-2">
                  Tipo*
                </label>
                <Select
                  onChange={() => {
                    setTicketFormData({
                      ...ticketFormData,
                      tipo: selectedType.value as ServicioTipo,
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
              <div className="relative w-2/4">
                <label className="block text-gray-600 text-base font-medium mb-2">
                  Categoría*
                </label>
                {categories.length > 0 && (
                  <SelectWithSearch
                    options={categories
                      .filter((category) => category.tipo === "SERVICIO")
                      .map((category) => ({
                        value: category.id,
                        label: category.nombre,
                        onClick: (value, label) => {
                          setSelectedCategory({
                            value,
                            label,
                          });
                        },
                      }))}
                    selected={selectedCategory}
                    onChange={() => {
                      setTicketFormData({
                        ...ticketFormData,
                        categoría_id: selectedCategory.value! as number,
                      });
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
                      <option value={0}>
                        No se ha encontrado ninguna categoría
                      </option>
                    </select>
                    <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
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
                      className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-11 right-4 absolute"
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
            </div>
            <div className="w-full">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Descripción
              </label>
              <div className="h-full">
                <Editor
                  tinymceScriptSrc={"/tinymce/tinymce.min.js"}
                  onEditorChange={(_evt, editor) =>
                    setTicketFormData({
                      ...ticketFormData,
                      descripción: editor.getContent(),
                    })
                  }
                  initialValue={ticketFormData.descripción}
                  value={ticketFormData.descripción}
                  init={{
                    menubar: true,
                    promotion: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "anchor",
                      "visualblocks",
                      "code",
                      "media",
                      "help",
                      "wordcount",
                    ],
                    toolbar:
                      "undo redo | blocks | " +
                      "bold italic forecolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | removeformat",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    language: "es",
                    ui_mode: "split",
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleButtonClose}
                className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={clsx({
                  ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                    !selectedClient.label?.startsWith("Seleccionar"),
                  ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                    selectedClient.label?.startsWith("Seleccionar"),
                })}
              >
                Completar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const [loading, setLoading] = useState(true);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [categories, setCategories] = useState<Categoría[]>([]);
  const [selectedClient, setSelectedClient] = useState<Selected>({
    value: -1,
    label: "Seleccionar cliente",
  });
  const [selectedPriority, setSelectedPriority] = useState<Selected>({
    value: "",
    label: "Seleccionar prioridad",
  });
  const [ticketFormData, setTicketFormData] = useState<Ticket>({
    prioridad: "BAJA",
    estado: "ABIERTO",
    asunto: "",
    tipo: "TIENDA",
    descripción: "",
    categoría_id: -1,
    cliente_id: -1,
  });
  const [selectedCategory, setSelectedCategory] = useState<Selected>({
    value: -1,
    label: "Seleccionar categoría",
  });
  const [selectedType, setSelectedType] = useState<Selected>({
    label: "Seleccionar tipo",
    value: "",
  });
  const [showFullDescription, setShowFullDescription] = useState(false);

  const resetFormData = () => {
    setTicketFormData({
      prioridad: "BAJA",
      estado: "ABIERTO",
      tipo: "TIENDA",
      descripción: "",
      categoría_id: -1,
      cliente_id: -1,
      asunto: "",
    });
    setSelectedClient({
      value: -1,
      label: "Selecciona el cliente",
    });
    setSelectedPriority({
      value: "",
      label: "Seleccionar prioridad",
    });
    setSelectedCategory({
      value: -1,
      label: "Seleccionar categoría",
    });
    setSelectedType({
      value: "",
      label: "Seleccionar tipo",
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Previene el scroll en el fondo
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (clients.length === 0) {
      setLoading(true);
      void loadClients();
    }
  }, [clients.length]);

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(true);
      void loadCategories();
    }
  }, [categories.length]);

  const handleClose = () => {
    closeModal();
    resetFormData();
    setIsConfirmationScreen(false);
  };

  const loadClients = async () => {
    const data = await ClientService.getAll(1, 100);
    if (data === false) {
      setLoading(false);
    } else {
      setClients(data.rows);
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const data = await CategoryService.getAll(1, 100);
    if (data === false) {
      setLoading(false);
    } else {
      setCategories(data.rows);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();

    const loadingToast = toast.loading("Añadiendo ticket...");
    const response = await TicketService.create(ticketFormData);
    toast.dismiss(loadingToast);
    setOperationAsCompleted();

    if (response.status === "error") {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);

    if (options.find()?.creación.siempre) {
      await handleCreateMessage(response.ticket!);
    }
  };

  const handleCreateMessage = async (ticket: Ticket) => {
    const messageToast = toast.loading("Creando mensaje...");
    const rendered = await MessageRender.renderTicketCreationTemplate(
      ticket.id!
    );

    if (!rendered || rendered === "Plantilla desactivada") {
      toast.dismiss(messageToast);
      toast.error(
        rendered
          ? "La plantilla está desactivada"
          : "Mensaje no pudo ser creado."
      );
      return;
    }

    const message: Mensaje = {
      contenido: rendered,
      servicio_id: ticket.id!,
      estado: "NO_ENVIADO",
    };

    const response = await MessageService.create(ticket.id!, message);

    if (response.status === "success") {
      toast.dismiss(messageToast);
      toast.success(response.message);
      await handleSendMessage(ticket, rendered, response.mensaje!);
    } else {
      toast.dismiss(messageToast);
      toast.error(response.message);
    }
  };

  const handleSendMessage = async (
    ticket: Ticket,
    rendered: string,
    mensaje: Mensaje
  ) => {
    if (ticket.cliente?.enviarMensajes && options.find()?.envio.siempre) {
      const sendingToast = toast.loading("Enviando mensaje...");
      const res = await MessageSenderService.send(
        ticket.cliente.telefono || "",
        rendered
      );

      if (res) {
        toast.dismiss(sendingToast);
        toast.success("Mensaje enviado exitosamente.");
        await updateMessageStatus(ticket.id!, mensaje.id!, mensaje.contenido);
      } else {
        toast.dismiss(sendingToast);
        toast.error("Mensaje no pudo ser enviado.");
      }
    }
  };

  const updateMessageStatus = async (
    ticketId: number,
    messageId: number,
    contenido: string
  ) => {
    await MessageService.update(ticketId, messageId, {
      id: messageId,
      estado: "ENVIADO",
      contenido,
      servicio_id: ticketId,
    });
  };

  if (!isOpen) {
    return null;
  }

  const renderConfirmationScreen = () => {
    const toggleDescription = () => {
      setShowFullDescription((prev) => !prev);
    };

    return (
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Asunto */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Asunto
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {ticketFormData.asunto}
              </p>
            </div>

            {/* Prioridad */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Prioridad
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {selectedPriority.label}
              </p>
            </div>

            {/* Cliente */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Cliente
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {selectedClient.label}
              </p>
            </div>

            {/* Tipo */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Tipo
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {selectedType.label}
              </p>
            </div>

            {/* Categoría */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Categoría
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {selectedCategory.label}
              </p>
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Descripción
              </p>
              <div
                className={`text-gray-900 font-medium text-base break-words p-2 border rounded ${
                  showFullDescription
                    ? "max-h-80 overflow-y-auto"
                    : "max-h-40 overflow-hidden"
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: ticketFormData.descripción ?? "",
                  }}
                />
              </div>
              {(ticketFormData.descripción?.length ?? 0) > 200 && (
                <button
                  type="button"
                  onClick={toggleDescription}
                  className="text-blue-500 mt-2"
                >
                  {showFullDescription ? "Ver Menos" : "Ver Más"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setIsConfirmationScreen(false)}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Volver
          </button>
          <button
            onClick={handleFinalSubmit}
            className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
          >
            Guardar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10"
      onClick={handleClose}
    >
      <div
        className="bg-white w-max max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow relative max-h-[650px] overflow-y-scroll scrollbar-thin"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal cierre el mismo
      >
        <div className="bg-[#2096ed] py-3 md:py-4 px-6 md:px-8 rounded-t">
          <h1 className="text-lg md:text-xl font-bold text-white">
            {isConfirmationScreen ? "Confirmar Ticket" : "Añadir ticket"}
          </h1>
        </div>
        {isConfirmationScreen ? (
          renderConfirmationScreen()
        ) : (
          <form
            className="flex flex-col p-8 pt-6 gap-4 group"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <div className="w-full">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Asunto*
              </label>
              <input
                type="text"
                onChange={(e) => {
                  setTicketFormData({
                    ...ticketFormData,
                    asunto: e.target.value,
                  });
                }}
                value={ticketFormData.asunto}
                placeholder="Introducir asunto"
                className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                pattern="^.{2,}$"
                name="name"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Mínimo 2 caracteres
              </span>
            </div>
            <div>
              <div className="relative">
                <label className="block text-gray-600 text-base font-medium mb-2">
                  Prioridad*
                </label>
                <Select
                  onChange={() => {
                    setTicketFormData({
                      ...ticketFormData,
                      prioridad: selectedPriority.value as TicketPrioridad,
                    });
                  }}
                  options={[
                    {
                      value: "BAJA",
                      label: "Baja",
                      onClick: (value, label) => {
                        setSelectedPriority({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "MEDIA",
                      label: "Media",
                      onClick: (value, label) => {
                        setSelectedPriority({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "ALTA",
                      label: "Alta",
                      onClick: (value, label) => {
                        setSelectedPriority({
                          value,
                          label,
                        });
                      },
                    },
                  ]}
                  selected={selectedPriority}
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Cliente*
              </label>
              {clients.length > 0 && (
                <SelectWithSearch
                  options={clients.map((client) => ({
                    value: client.id,
                    label: `${client.nombre} ${client.apellido}${
                      client.documento ? ", " : ""
                    }${client.documento ? client.documento : ""}`,
                    onClick: (value, label) => {
                      setSelectedClient({
                        value,
                        label,
                      });
                    },
                  }))}
                  selected={selectedClient}
                  onChange={() => {
                    setTicketFormData({
                      ...ticketFormData,
                      cliente_id: selectedClient.value! as number,
                    });
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
                    <option value={0}>
                      No se ha encontrado ningún cliente
                    </option>
                  </select>
                  <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
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
                    className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-11 right-4 absolute"
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
            <div className="flex gap-2">
              <div className="relative w-2/4">
                <label className="block text-gray-600 text-base font-medium mb-2">
                  Tipo*
                </label>
                <Select
                  onChange={() => {
                    setTicketFormData({
                      ...ticketFormData,
                      tipo: selectedType.value as ServicioTipo,
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
              <div className="relative w-2/4">
                <label className="block text-gray-600 text-base font-medium mb-2">
                  Categoría*
                </label>
                {categories.length > 0 && (
                  <SelectWithSearch
                    options={categories
                      .filter((category) => category.tipo === "SERVICIO")
                      .map((category) => ({
                        value: category.id,
                        label: category.nombre,
                        onClick: (value, label) => {
                          setSelectedCategory({
                            value,
                            label,
                          });
                        },
                      }))}
                    selected={selectedCategory}
                    onChange={() => {
                      setTicketFormData({
                        ...ticketFormData,
                        categoría_id: selectedCategory.value! as number,
                      });
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
                    <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
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
                      className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-11 right-4 absolute"
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
            </div>
            <div className="w-full">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Descripción
              </label>
              <div className="h-full">
                <Editor
                  tinymceScriptSrc={"/tinymce/tinymce.min.js"}
                  onEditorChange={(_evt, editor) =>
                    setTicketFormData({
                      ...ticketFormData,
                      descripción: editor.getContent(),
                    })
                  }
                  initialValue={
                    ticketFormData.descripción?.length! > 0
                      ? ticketFormData.descripción
                      : "<p>Escribe aquí la descripción de tu ticket.</p>"
                  }
                  value={ticketFormData.descripción}
                  init={{
                    menubar: true,
                    promotion: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "anchor",
                      "visualblocks",
                      "code",
                      "media",
                      "help",
                      "wordcount",
                    ],
                    toolbar:
                      "undo redo | blocks | " +
                      "bold italic forecolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | removeformat",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    language: "es",
                    ui_mode: "split",
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={clsx({
                  ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                    !selectedClient.label?.startsWith("Selecciona") ||
                    !selectedCategory.label?.startsWith("Selecciona") ||
                    !selectedPriority.label?.startsWith("Selecciona") ||
                    !selectedType.label?.startsWith("Selecciona"),
                  ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                    true,
                })}
              >
                Completar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
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
      document.addEventListener("keydown", handleKeyDown);
    } else {
      handleClose();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const handleClose = () => {
    closeModal();
    ref.current?.close();
  };

  const handleDeleteTicket = async () => {
    const loadingToast = toast.loading("Eliminando ticket...");

    const data = await TicketService.delete(ticket?.id!);

    if (data.status === "success") {
      toast.success(data.message);
      if (options.find()?.creación.siempre) {
        await handleCreateMessage();
      }
    } else {
      toast.error(data.message);
    }

    toast.dismiss(loadingToast);
    setOperationAsCompleted();
  };

  const handleCreateMessage = async () => {
    const messageToast = toast.loading("Creando mensaje...");

    try {
      const rendered = await MessageRender.renderTicketEliminationTemplate(
        ticket!
      );

      if (!rendered || rendered === "Plantilla desactivada") {
        toast.error(
          rendered
            ? "La plantilla está desactivada"
            : "El mensaje no pudo ser creado."
        );
        toast.dismiss(messageToast);
        return;
      }

      toast.dismiss(messageToast);
      toast.success("Mensaje creado exitosamente.");

      if (ticket?.cliente?.enviarMensajes && options.find()?.envio.siempre) {
        await handleSendMessage(rendered);
      }
    } catch {
      toast.dismiss(messageToast);
      toast.error("Error inesperado al crear el mensaje.");
    }
  };

  const handleSendMessage = async (rendered: string) => {
    const sendingToast = toast.loading("Enviando mensaje...");

    try {
      const res = await MessageSenderService.send(
        ticket?.cliente?.telefono || "",
        rendered
      );

      if (!res) {
        toast.error("El mensaje no pudo ser enviado.");
        toast.dismiss(sendingToast);
        return;
      }

      toast.dismiss(sendingToast);
      toast.success("Mensaje enviado exitosamente.");
    } catch {
      toast.dismiss(sendingToast);
      toast.error("Error inesperado al enviar el mensaje.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
    await handleDeleteTicket();
  };

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        const dialogDimensions = ref.current?.getBoundingClientRect();
        if (
          dialogDimensions &&
          (e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom)
        ) {
          handleClose();
        }
      }}
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Eliminar ticket</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={handleSubmit}
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
            onClick={handleClose}
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

function ViewModal({ isOpen, closeModal, ticket }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const toggleDescription = () => {
    setShowFullDescription((prev) => !prev);
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Datos del ticket</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Asunto */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Asunto
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {ticket?.asunto}
              </p>
            </div>

            {/* Prioridad */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Prioridad
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(ticket?.prioridad!)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Estado
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(ticket?.estado || "")}
              </p>
            </div>

            {/* Cliente */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Cliente
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {ticket?.cliente?.nombre || ""}{" "}
                {ticket?.cliente?.apellido || ""}
                {ticket?.cliente?.documento
                  ? `, ${ticket?.cliente?.documento}`
                  : ""}
              </p>
            </div>

            {/* Tipo */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Tipo
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {capitalizeFirstLetter(ticket?.prioridad!)}
              </p>
            </div>

            {/* Categoría */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Categoría
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {ticket?.categoría?.nombre}
              </p>
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Descripción
              </p>
              <div
                className={`text-gray-900 font-medium text-base break-words p-2 border rounded ${
                  showFullDescription
                    ? "max-h-80 overflow-y-auto"
                    : "max-h-40 overflow-hidden"
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: ticket?.descripción ?? "",
                  }}
                />
              </div>
              {(ticket?.descripción?.length ?? 0) > 200 && (
                <button
                  type="button"
                  onClick={toggleDescription}
                  className="text-blue-500 mt-2"
                >
                  {showFullDescription ? "Ver Menos" : "Ver Más"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={closeModal}
            className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
}

function DataRow({ ticket, setOperationAsCompleted }: DataRowProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.ticket
      ? "EDIT"
      : permissions.find()?.eliminar.ticket
      ? "DELETE"
      : permissions.find()?.ver.mensaje
      ? "VIEW_MESSAGES"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    permissions.find()?.editar.ticket ||
    permissions.find()?.eliminar.ticket ||
    permissions.find()?.ver.mensaje;

  const closeEditModal = () => {
    setIsEditOpen(false);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  return (
    <tr>
      <th
        scope="row"
        className="px-6 py-3 font-medium text-[#2096ed] whitespace-nowrap border border-slate-300 w-[50px]"
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
      <td className="px-6 py-2 border border-slate-300">
        {ticket?.prioridad === "BAJA" ? (
          <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-lg capitalize">
            Baja
          </div>
        ) : ticket?.prioridad === "MEDIA" ? (
          <div className="bg-yellow-200 text-center text-yellow-600 text-xs py-2 font-bold rounded-lg capitalize">
            Media
          </div>
        ) : (
          <div className="bg-red-200 text-center text-red-600 text-xs py-2 font-bold rounded-lg capitalize">
            Alta
          </div>
        )}
      </td>
      <td className="px-6 py-3 border border-slate-300 truncate">
        {ticket?.cliente?.nombre} {ticket?.cliente?.apellido}, {ticket?.cliente?.documento}
      </td>
      <td className="px-6 py-3 border border-slate-300 truncate max-w-[200px]">{ticket?.asunto}</td>
      <td className="px-6 py-3 border border-slate-300 truncate">
        {format(new Date(ticket?.creado!), "dd/MM/yyyy hh:mm a")}
      </td>
      <td className="px-6 py-3 border border-slate-300 truncate">
        {ticket?.cerrado
          ? format(new Date(ticket?.cerrado!), "dd/MM/yyyy hh:mm a")
          : "Nunca"}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 relative min-w-[200px] w-[200px]"
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
        {action === "VIEW" && (
          <>
            <button
              onClick={() => {
                setIsViewOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Mostrar ticket
            </button>
            <ViewModal
              ticket={ticket}
              isOpen={isViewOpen}
              closeModal={closeViewModal}
              setOperationAsCompleted={() => null}
            />
          </>
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
              (ref?.current?.getBoundingClientRect().top ?? 0) +
              (window.scrollY ?? 0) +
              (ref?.current?.getBoundingClientRect().height ?? 0) -
              10
            }
            left={
              (ref?.current?.getBoundingClientRect().left ?? 0) +
              window.scrollX +
              25
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
        ) : null}
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
          right-0
          top-9
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
    >
      {permissions.find()?.crear.ticket && (
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

function IndividualDropup({ id, close, selectAction, top }: DropupProps) {
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
      style={{ top: top }}
    >
      {permissions.find()?.editar.ticket && (
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
      {permissions.find()?.eliminar.ticket && (
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
      <li>
        <div
          onClick={() => {
            selectAction("VIEW");
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
          Mostrar ticket
        </div>
      </li>
      {permissions.find()?.editar.ticket &&
        permissions.find()?.eliminar.ticket && (
          <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
        )}
      {permissions.find()?.ver.mensaje && (
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
    if (selectedSearchType.value === "CLIENTE") {
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
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
                  <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
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
                  <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
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
                  <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
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
                    className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed] top-11 right-4 absolute"
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
                  selectedSearchType?.value === "CLIENTE"),
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
    permissions.find()?.crear.ticket ? "ADD" : "SEARCH"
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
  const size = 8;

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
      void TicketService.getAll(page, size).then((data) => {
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
          void TicketService.getToday(param, page, size).then((data) => {
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
          void TicketService.getRecent(param, page, size).then((data) => {
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
          void TicketService.getThisWeek(param, page, size).then((data) => {
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
          void TicketService.getThisMonth(param, page, size).then((data) => {
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
          void TicketService.getThisYear(param, page, size).then((data) => {
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
            void TicketService.getOpenBetween(
              new Date(input).toISOString().split("T")[0],
              new Date(secondInput).toISOString().split("T")[0],
              page,
              size
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
            void TicketService.getClosedBetween(
              new Date(input).toISOString().split("T")[0],
              new Date(secondInput).toISOString().split("T")[0],
              page,
              size
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
        void TicketService.getByClient(searchId, page, size).then((data) => {
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
        void TicketService.getByCategory(searchId, page, size).then((data) => {
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
        void TicketService.getByState(input, page, size).then((data) => {
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
        void TicketService.getById(searchId).then((data) => {
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
      }
    }
  }, [isOperationCompleted, searchCount, page]);

  useEffect(() => {
    setPage(1);
  }, [searchCount]);

  return (
    <>
      <div className="absolute w-full h-full px-8 py-5">
        <nav className="flex justify-between items-center select-none max-[380px]:flex-col gap-4">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">Tickets</span>
          </div>
          <div className="flex gap-2 relative">
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={() => null}
                openSearchModal={() => null}
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
                    Prioridad
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Asunto
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
