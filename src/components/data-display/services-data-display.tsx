import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Servicio,
  Selected,
  Categoría,
  Mensaje,
  ServicioTipo,
  ServicioEstado,
} from "../../types";
import { useNavigate, useParams } from "react-router-dom";
import ServiceService from "../../services/service-service";
import toast, { Toaster } from "react-hot-toast";
import Select from "../misc/select";
import SelectWithSearch from "../misc/select-with-search";
import CategoryService from "../../services/category-service";
import { format } from "date-fns";
import session from "../../utils/session";
import permissions from "../../utils/permissions";
import options from "../../utils/options";
import MessageRender from "../../services/message-render-service";
import MessageService from "../../services/message-service";
import TicketService from "../../services/ticket-service";
import MessageSenderService from "../../services/message-sender-service";
import { useServiceSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import clsx from "clsx";
import { useFunctionStore } from "../../store/functionStore";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const { id } = useParams();
  const ref = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Categoría[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Selected>({
    value: -1,
    label: "Seleccionar categoría",
  });
  const [selectedType, setSelectedType] = useState<Selected>({
    label: "Seleccionar tipo",
    value: "",
  });
  const [formData, setFormData] = useState<Servicio>({
    nombre: "",
    descripción: "",
    tipo: "TIENDA",
    estado: "PENDIENTE",
    necesidades: "",
    notas: "",
    resultado: "",
    categoría_id: -1,
    ticket_id: Number(id),
  });

  const resetFormData = () => {
    setFormData({
      nombre: "",
      descripción: "",
      tipo: "TIENDA",
      estado: "PENDIENTE",
      necesidades: "",
      notas: "",
      resultado: "",
      categoría_id: -1,
      ticket_id: Number(id),
    });
    setSelectedCategory({
      value: -1,
      label: "Seleccionar categoría",
    });
    setSelectedType({
      label: "Seleccionar tipo",
      value: "",
    });
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
    if (categories.length === 0) {
      setLoading(true);
      CategoryService.getAll(1, 100000).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setLoading(false);
          setCategories(data.rows);
        }
      });
    }
  }, []);

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
      className="w-2/4 h-fit rounded-md shadow-md scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadir servicio</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Añadiendo servicio...");
          ServiceService.create(Number(id), formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Servicio no pudo ser añadido.");
            } else {
              toast.success("Servicio añadido con exito.");
              if (options.find()?.creación.siempre) {
                const messageToast = toast.loading("Creando mensaje...");
                MessageRender.renderServicioCreationTemplate(
                  Number(id),
                  data.id!
                ).then((rendered) => {
                  if (rendered) {
                    if (rendered === "Plantilla desactivada") {
                      toast.dismiss(messageToast);
                      toast.error("La plantilla esta desactivada");
                      return;
                    }

                    const message: Mensaje = {
                      contenido: rendered,
                      ticket_id: Number(id),
                      estado: "NO_ENVIADO",
                    };

                    MessageService.create(Number(id), message).then(
                      (mensaje) => {
                        if (mensaje) {
                          toast.dismiss(messageToast);
                          toast.success("Mensaje creado exitosamente.");
                          TicketService.getById(Number(id)).then(
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
                                          Number(id),
                                          mensaje.id!,
                                          //@ts-ignore
                                          {
                                            id: mensaje.id!,
                                            estado: "ENVIADO",
                                            ticket_id: Number(id),
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
        <div className="w-full">
          <input
            type="text"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
              });
            }}
            value={formData.nombre}
            placeholder="Nombre*"
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            required
            pattern="^.{2,}$"
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 2 caracteres
          </span>
        </div>
        <div className="flex gap-2">
          <div className="relative w-2/4">
            <Select
              onChange={() => {
                setFormData({
                  ...formData,
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
                  setFormData({
                    ...formData,
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
        </div>
        <div className="w-full">
          <textarea
            rows={3}
            placeholder="Descripción"
            onChange={(e) => {
              setFormData({
                ...formData,
                descripción: e.target.value,
              });
            }}
            value={formData.descripción || ""}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            minLength={10}
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 10 caracteres
          </span>
        </div>
        <div className="flex gap-4">
          <div className="w-2/4">
            <textarea
              rows={3}
              placeholder="Necesidades"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  necesidades: e.target.value,
                });
              }}
              value={formData.necesidades || ""}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={10}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 10 caracteres
            </span>
          </div>
          <div className="w-2/4">
            <textarea
              rows={3}
              placeholder="Notas"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  notas: e.target.value,
                });
              }}
              value={formData.notas || ""}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={10}
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 10 caracteres
            </span>
          </div>
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
                !selectedCategory.label?.startsWith("Seleccionar") &&
                !selectedType.label?.startsWith("Seleccionar"),
              ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                selectedCategory.label?.startsWith("Seleccionar") ||
                selectedType.label?.startsWith("Seleccionar"),
            })}
          >
            Completar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  servicio,
}: ModalProps) {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Categoría[]>([]);
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Servicio>(servicio!);
  const [selectedCategory, setSelectedCategory] = useState<Selected>({
    value: servicio?.categoría_id,
    label: servicio?.categoría?.nombre,
  });
  const [selectedState, setSelectedState] = useState<Selected>({
    value: servicio?.estado,
    label:
      servicio?.estado === "INICIADO"
        ? "Iniciado"
        : servicio?.estado === "PENDIENTE"
        ? "Pendiente"
        : "Completado",
  });
  const [selectedType, _setSelectedType] = useState<Selected>({
    label:
      servicio?.tipo === "DOMICILIO"
        ? "Domicilio"
        : servicio?.tipo === "TIENDA"
        ? "Tienda"
        : "Remoto",
    value: servicio?.tipo,
  });

  const resetFormData = () => {
    setFormData(servicio!);
    setSelectedCategory({
      value: servicio?.categoría_id,
      label: servicio?.categoría?.nombre,
    });
    setSelectedState({
      value: servicio?.estado,
      label:
        servicio?.estado === "INICIADO"
          ? "Iniciado"
          : servicio?.estado === "PENDIENTE"
          ? "Pendiente"
          : "Completado",
    });
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

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(true);
      CategoryService.getAll(1, 10000).then((data) => {
        if (data === false) {
          setLoading(false);
        } else {
          setLoading(false);
          setCategories(data.rows);
        }
      });
    }
  }, []);

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
      className="w-2/5 h-fit rounded-md shadow text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar servicio</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando servicio...");
          ServiceService.update(Number(id), servicio?.id!, formData).then(
            (data) => {
              toast.dismiss(loadingToast);
              setOperationAsCompleted();
              if (!data) {
                toast.error("Servicio no pudo ser editado.");
              } else {
                toast.success("Servicio editado con exito.");
                if (options.find()?.creación.siempre) {
                  const messageToast = toast.loading("Creando mensaje...");
                  MessageRender.renderServicioModificationTemplate(
                    Number(id),
                    servicio?.id!,
                    servicio!
                  ).then((rendered) => {
                    if (rendered) {
                      if (rendered === "Plantilla desactivada") {
                        toast.dismiss(messageToast);
                        toast.error("La plantilla esta desactivada");
                        return;
                      }

                      const message: Mensaje = {
                        contenido: rendered,
                        ticket_id: Number(id),
                        estado: "NO_ENVIADO",
                      };

                      MessageService.create(Number(id), message).then(
                        (mensaje) => {
                          if (mensaje) {
                            toast.dismiss(messageToast);
                            toast.success("Mensaje creado exitosamente.");
                            TicketService.getById(Number(id)).then(
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
                                            Number(id),
                                            mensaje.id!,
                                            //@ts-ignore
                                            {
                                              id: mensaje.id!,
                                              estado: "ENVIADO",
                                              ticket_id: Number(id),
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
              setOperationAsCompleted();
            }
          );
        }}
      >
        <div className="w-full">
          <input
            type="text"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
              });
            }}
            value={formData.nombre}
            placeholder="Nombre*"
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            required
            pattern="^.{2,}$"
            name="name"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Minimo 2 caracteres
          </span>
        </div>
        <div className="flex gap-2">
          <div className="relative w-2/4">
            <select
              className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
              value={selectedType.value}
              disabled={true}
            >
              <option value={selectedType.value}>{selectedType.label}</option>
            </select>
            <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
          </div>
          <div className="relative w-2/4">
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
                  setFormData({
                    ...formData,
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
        </div>
        {servicio?.estado === "PENDIENTE" ? (
          <div className="relative">
            <Select
              onChange={() => {
                setFormData({
                  ...formData,
                  estado: selectedState.value as ServicioEstado,
                  resultado:
                    selectedState.value !== "COMPLETADO"
                      ? ""
                      : formData.resultado,
                });
              }}
              options={[
                {
                  value: "PENDIENTE",
                  label: "Pendiente",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "INICIADO",
                  label: "Iniciado",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "COMPLETADO",
                  label: "Completado",
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
        {servicio?.estado === "INICIADO" ? (
          <div className="relative">
            <Select
              options={[
                {
                  value: "INICIADO",
                  label: "Iniciado",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "COMPLETADO",
                  label: "Completado",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
              ]}
              selected={selectedState}
              onChange={() => {
                setFormData({
                  ...formData,
                  estado: selectedState.value as ServicioEstado,
                  resultado:
                    selectedState.value !== "COMPLETADO"
                      ? ""
                      : formData.resultado,
                });
              }}
            />
          </div>
        ) : null}
        {servicio?.estado === "COMPLETADO" ? (
          <div className="relative">
            <select
              className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
              value={0}
              disabled={true}
            >
              <option value={0}>Completado</option>
            </select>
            <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
          </div>
        ) : null}
        <div className="flex gap-4">
          <div className="w-2/4">
            <textarea
              rows={3}
              placeholder="Descripción"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  descripción: e.target.value,
                });
              }}
              value={formData.descripción || ""}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={10}
              name="name"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 10 caracteres
            </span>
          </div>
          <div className="w-2/4">
            <textarea
              rows={3}
              placeholder="Resultado"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  resultado: e.target.value,
                });
              }}
              value={formData.resultado || ""}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={10}
              name="name"
              disabled={formData.estado !== "COMPLETADO"}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 10 caracteres
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-2/4">
            <textarea
              rows={3}
              placeholder="Necesidades"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  necesidades: e.target.value,
                });
              }}
              value={formData.necesidades || ""}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={10}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 10 caracteres
            </span>
          </div>
          <div className="w-2/4">
            <textarea
              rows={3}
              placeholder="Notas"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  notas: e.target.value,
                });
              }}
              value={formData.notas || ""}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              minLength={10}
              name="name"
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
          <button
            className={clsx({
              ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                !selectedCategory.label?.startsWith("Seleccionar") &&
                !selectedType.label?.startsWith("Seleccionar"),
              ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                selectedCategory.label?.startsWith("Seleccionar") ||
                selectedType.label?.startsWith("Seleccionar"),
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
  servicio,
}: ModalProps) {
  const { id } = useParams();
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
      className="w-2/5 h-fit rounded-md shadow"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center text-base"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando servicio...");
          ServiceService.delete(Number(id), servicio?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Servicio eliminado con exito.");
              if (options.find()?.creación.siempre) {
                const messageToast = toast.loading("Creando mensaje...");
                MessageRender.renderServicioEliminationTemplate(
                  Number(id),
                  servicio!
                ).then((rendered) => {
                  if (rendered) {
                    if (rendered === "Plantilla desactivada") {
                      toast.dismiss(messageToast);
                      toast.error("La plantilla esta desactivada");
                      return;
                    }
                    const message: Mensaje = {
                      contenido: rendered,
                      ticket_id: Number(id),
                      estado: "NO_ENVIADO",
                    };
                    MessageService.create(Number(id), message).then(
                      (mensaje) => {
                        if (mensaje) {
                          toast.dismiss(messageToast);
                          toast.success("Mensaje creado exitosamente.");
                          TicketService.getById(Number(id)).then(
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
                                          Number(id),
                                          mensaje.id!,
                                          //@ts-ignore
                                          {
                                            id: mensaje.id!,
                                            estado: "ENVIADO",
                                            ticket_id: Number(id),
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
            } else {
              toast.error("Servicio no pudo ser eliminado.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        <div className="place-self-center  flex flex-col items-center">
          <Warning className="fill-red-400 h-16 w-16" />
          <p className="font-bold text-lg text-center mt-2">
            ¿Esta seguro de que desea continuar?
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

function DataRow({ setOperationAsCompleted, servicio }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [action, setAction] = useState<`${Action}`>(
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.editar.servicio
      ? "EDIT"
      : permissions.find()?.eliminar.servicio
      ? "DELETE"
      : permissions.find()?.ver.operación
      ? "VIEW_OPERATIONS"
      : "NONE"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
    permissions.find()?.editar.servicio
      ? true
      : permissions.find()?.eliminar.servicio
      ? true
      : permissions.find()?.ver.operación
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
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300"
      >
        {servicio?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300 max-w-[200px] truncate">
        {servicio?.nombre}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        <div className="bg-gray-200 text-center text-gray-600 text-xs p-2 font-bold rounded-lg capitalize">
          {servicio?.tipo === "TIENDA"
            ? "Tienda"
            : servicio?.tipo === "DOMICILIO"
            ? "Domicilio"
            : "Remoto"}
        </div>
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {servicio?.estado === "COMPLETADO" ? (
          <div className="bg-green-200 text-center text-green-600 text-xs p-2 font-bold rounded-lg capitalize">
            Completado
          </div>
        ) : servicio?.estado === "INICIADO" ? (
          <div className="bg-blue-200 text-center text-blue-600 text-xs p-2 font-bold rounded-lg capitalize">
            Iniciado
          </div>
        ) : (
          <div className="bg-gray-200 text-center text-gray-600 text-xs p-2 font-bold rounded-lg capitalize">
            Pendiente
          </div>
        )}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {format(new Date(servicio?.añadido!), "dd/MM/yyyy")}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {servicio?.iniciado
          ? format(new Date(servicio?.iniciado!), "dd/MM/yyyy")
          : "Nunca"}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {servicio?.completado
          ? format(new Date(servicio?.completado!), "dd/MM/yyyy")
          : "Nunca"}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 w-[210px] relative"
      >
        {action === "EDIT" && (
          <>
            <button
              onClick={() => {
                setIsEditOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar servicio
            </button>
            <EditModal
              servicio={servicio}
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
              Eliminar servicio
            </button>
            <DeleteModal
              servicio={servicio}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "VIEW_OPERATIONS" && (
          <button
            onClick={() => {
              navigate(`/tickets/${id}/servicios/${servicio?.id}/operaciones`);
            }}
            className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
          >
            Operaciones
          </button>
        )}
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => {}}
            openSearchModal={() => {}}
            id={servicio?.id}
            top={
              ref?.current?.getBoundingClientRect().top! +
              window.scrollY +
              ref?.current?.getBoundingClientRect().height! -
              15
            }
            right={
              ref?.current?.getBoundingClientRect().left! +
              window.scrollX -
              1085
            }
          />
        )}
        {anyAction ? (
          <button
            id={`acciones-btn-${servicio?.id}`}
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
          mt-1
          m-0
          bg-clip-padding
          border-none
        "
    >
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        permissions.find()?.crear.servicio) && (
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
            Añadir servicio
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
          Buscar servicio
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
      style={{ top: top, right: right }}
    >
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        permissions.find()?.editar.servicio) && (
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
            Editar servicio
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        permissions.find()?.eliminar.servicio) && (
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
            Eliminar servicio
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        (permissions.find()?.editar.servicio &&
          permissions.find()?.eliminar.servicio)) && (
        <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        permissions.find()?.ver.operación) && (
        <li>
          <div
            onClick={() => {
              selectAction("VIEW_OPERATIONS");
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
            Operaciones
          </div>
        </li>
      )}
    </ul>
  );
}

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedState, setSelectedState] = useState<Selected>({
    value: -1,
    label: "Seleccionar estado",
  });
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const [selectedFecha, setSelectedFecha] = useState<Selected>({
    value: "",
    label: "Seleccionar tipo de busqueda",
  });
  const tempInput = useServiceSearchParamStore((state) => state.tempInput);
  const secondTempInput = useServiceSearchParamStore(
    (state) => state.secondTempInput
  );
  const setInput = useServiceSearchParamStore((state) => state.setInput);
  const setTempInput = useServiceSearchParamStore(
    (state) => state.setTempInput
  );
  const setSecondInput = useServiceSearchParamStore(
    (state) => state.setSecondInput
  );
  const setSecondTempInput = useServiceSearchParamStore(
    (state) => state.setSecondTempInput
  );
  const setParam = useServiceSearchParamStore((state) => state.setParam);
  const setSecondParam = useServiceSearchParamStore(
    (state) => state.setSecondParam
  );
  const incrementSearchCount = useServiceSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);

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
    setSelectedState({
      value: -1,
      label: "Seleccionar estado",
    });
    setWasSearch(false);
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
        <h1 className="text-xl font-bold text-white">Buscar servicio</h1>
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
                value: "AÑADIDO",
                label: "Fecha añadido",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "INICIADO",
                label: "Fecha de inicio",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "COMPLETADO",
                label: "Fecha completado",
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
        {selectedSearchType.value === "ESTADO" ? (
          <div className="relative">
            <Select
              onChange={() => {
                setInput(selectedState.value as string);
              }}
              options={[
                {
                  value: "PENDIENTE",
                  label: "Pendiente",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "INICIADO",
                  label: "Iniciado",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "COMPLETADO",
                  label: "Completado",
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
        {selectedSearchType.value === "AÑADIDO" ||
        selectedSearchType.value === "INICIADO" ||
        selectedSearchType.value === "COMPLETADO" ? (
          <div className="relative">
            <Select
              onChange={() => {
                setSecondParam(selectedFecha.value as string);
              }}
              options={[
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
        {selectedFecha.value === "ENTRE" ? (
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
                  selectedSearchType.value !== "ESTADO") ||
                (selectedState.label?.startsWith("Seleccionar") &&
                  selectedSearchType.value === "ESTADO"),
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

export default function ServicesDataDisplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.crear.servicio
      ? "ADD"
      : "SEARCH"
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useServiceSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useServiceSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useServiceSearchParamStore((state) => state.input);
  const param = useServiceSearchParamStore((state) => state.param);
  const secondInput = useServiceSearchParamStore((state) => state.secondInput);
  const [isSearch, setIsSearch] = useState(false);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const resetAllSearchs = useFunctionStore((state) => state.resetAllSearchs);

  const openAddModal = () => {
    setIsAddOpen(true);
  };

  const closeAddModal = () => {
    setIsAddOpen(false);
  };

  const closeDropup = () => {
    setIsDropup(false);
  };

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  const setAsCompleted = () => {
    setIsOperationCompleted(true);
  };

  useEffect(() => {
    if (searchCount === 0) {
      ServiceService.getAll(Number(id), page, 8).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          setServices([]);
          resetSearchCount();
          setWasSearch(false);
        } else {
          setServices(data.rows);
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
      if (wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        if (param === "AÑADIDO") {
          ServiceService.getBetweenAñadido(
            Number(id),
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            8
          ).then((data) => {
            if (data === false) {
              setServices([]);
              setNotFound(true);
              setLoading(false);
            } else {
              setServices(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "INICIADO") {
          ServiceService.getBetweenIniciado(
            Number(id),
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            8
          ).then((data) => {
            if (data === false) {
              setServices([]);
              setNotFound(true);
              setLoading(false);
            } else {
              setServices(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "COMPLETADO") {
          ServiceService.getBetweenCompletado(
            Number(id),
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            8
          ).then((data) => {
            if (data === false) {
              setServices([]);
              setNotFound(true);
              setLoading(false);
            } else {
              setServices(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "ESTADO") {
          ServiceService.getByState(Number(id), input, page, 8).then((data) => {
            if (data === false) {
              setServices([]);
              setNotFound(true);
              setLoading(false);
            } else {
              setServices(data.rows);
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
    }
  }, [isOperationCompleted, searchCount, page]);

  useEffect(() => {
    setPage(1);
  }, [searchCount]);

  return (
    <>
      <div className="absolute w-full h-full px-8 py-5">
        <nav className="flex justify-between items-center text-slate-600 select-none">
          <div className="font-medium">
            Menu <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span
              onClick={() => {
                navigate(`/tickets`), resetAllSearchs();
              }}
              className="hover:text-[#2096ed] cursor-pointer"
            >
              Tickets
            </span>{" "}
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">{id}</span>{" "}
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">Servicios</span>
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
                Añadir servicio
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
                  Buscar servicio
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
        {services.length > 0 && loading == false && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Añadido
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Iniciado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Completado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => {
                  return (
                    <DataRow
                      action={action}
                      servicio={service}
                      setOperationAsCompleted={setAsCompleted}
                      key={service.id}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true ||
          (services.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún servicio encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningún servicio registrado."
                  : "Esto puede deberse a un error del servidor, o a que ningún servicio concuerda con tu busqueda"}
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
      {services.length > 0 && loading == false && (
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
