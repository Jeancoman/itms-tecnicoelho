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
  Operación,
  Mensaje,
  Selected,
} from "../../types";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import OperationService from "../../services/operation-service";
import session from "../../utils/session";
import permissions from "../../utils/permissions";
import options from "../../utils/options";
import MessageRender from "../../services/message-render-service";
import MessageService from "../../services/message-service";
import TicketService from "../../services/ticket-service";
import MessageSenderService from "../../services/message-sender-service";
import { useOperationSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import Select from "../misc/select";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const { id, service_id } = useParams();
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Operación>({
    nombre: "",
    descripción: "",
    necesidades: "",
    estado: "PENDIENTE",
  });

  const resetFormData = () => {
    setFormData({
      nombre: "",
      descripción: "",
      necesidades: "",
      estado: "PENDIENTE",
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
      className="w-2/5 h-fit rounded-md shadow-md scrollbar-none"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadiendo operación</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Añadiendo operación...");
          OperationService.create(
            Number(id),
            Number(service_id),
            formData
          ).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Operación no pudo ser añadida.");
            } else {
              toast.success("Operación añadida con exito.");
              if (options.find()?.creación.siempre) {
                const messageToast = toast.loading("Creando mensaje...");
                MessageRender.renderOperaciónCreationTemplate(
                  Number(id),
                  Number(service_id),
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
        <input
          type="text"
          onChange={(e) => {
            setFormData({
              ...formData,
              nombre: e.target.value,
            });
          }}
          placeholder="Nombre*"
          value={formData.nombre}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed] w-2/4"
        />
        <textarea
          rows={3}
          placeholder="Descripción*"
          onChange={(e) => {
            setFormData({
              ...formData,
              descripción: e.target.value,
            });
          }}
          value={formData.descripción}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        <textarea
          rows={3}
          placeholder="Necesidades"
          onChange={(e) => {
            setFormData({
              ...formData,
              necesidades: e.target.value,
            });
          }}
          value={formData.necesidades}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
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

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  operación,
}: ModalProps) {
  const { id, service_id } = useParams();
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Operación>(operación!);
  const [selectedState, setSelectedState] = useState<Selected>({
    value: formData.estado,
    label:
      formData.estado === "INICIADA"
        ? "Iniciada"
        : formData.estado === "PENDIENTE"
        ? "Pendiente"
        : "Completada",
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
      className="w-2/5 h-fit rounded-xl shadow"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar operación</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 text-base"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando operación...");
          OperationService.update(
            Number(id),
            Number(service_id),
            operación?.id!,
            formData
          ).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data) {
              toast.success("Operación editada con exito.");
              if (options.find()?.creación.siempre) {
                const messageToast = toast.loading("Creando mensaje...");
                MessageRender.renderOperaciónModificationTemplate(
                  Number(id),
                  Number(service_id),
                  operación?.id!,
                  formData
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
              toast.error("Operación no pudo ser editada.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        <input
          type="text"
          onChange={(e) => {
            setFormData({
              ...formData,
              nombre: e.target.value,
            });
          }}
          placeholder="Nombre*"
          value={formData.nombre}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed] w-2/4"
        />
        <textarea
          rows={3}
          placeholder="Descripción*"
          onChange={(e) => {
            setFormData({
              ...formData,
              descripción: e.target.value,
            });
          }}
          value={formData.descripción}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
        {formData.estado === "PENDIENTE" ? (
          <div className="relative">
            <Select
              options={[
                {
                  value: "INICIADA",
                  label: "Iniciada",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "COMPLETADA",
                  label: "Completada",
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
        {formData.estado === "INICIADA" ? (
          <div className="relative">
            <Select
              options={[
                {
                  value: "COMPLETADA",
                  label: "Completada",
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
        {formData.estado === "COMPLETADA" ? (
          <div className="relative">
            <select
              className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
              value={0}
              disabled={true}
            >
              <option value={0}>Completada</option>
            </select>
            <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
          </div>
        ) : null}
        <textarea
          rows={3}
          placeholder="Necesidades"
          onChange={(e) => {
            setFormData({
              ...formData,
              necesidades: e.target.value,
            });
          }}
          value={formData.necesidades}
          className="border p-2 rounded-lg outline-none focus:border-[#2096ed]"
        />
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
  operación,
}: ModalProps) {
  const { id } = useParams();
  const { service_id } = useParams();
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
      className="w-2/5 h-fit rounded-md shadow text-base"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando operación...");
          OperationService.delete(
            Number(id),
            Number(service_id),
            operación?.id!
          ).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Operación eliminada con exito.");
              if (options.find()?.creación.siempre) {
                const messageToast = toast.loading("Creando mensaje...");
                MessageRender.renderOperaciónEliminationTemplate(
                  Number(id),
                  Number(service_id),
                  operación!
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
              toast.error("Operación no pudo ser eliminada.");
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

function DataRow({ action, setOperationAsCompleted, operación }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300"
      >
        {operación?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300">{operación?.nombre}</td>
      <td className="px-6 py-4 border border-slate-300">
        {operación?.descripción}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {operación?.estado === "COMPLETADA" ? (
          <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-lg capitalize">
            Completada
          </div>
        ) : operación?.estado === "INICIADA" ? (
          <div className="bg-blue-200 text-center text-blue-600 text-xs py-2 font-bold rounded-lg capitalize">
            Iniciada
          </div>
        ) : (
          <div className="bg-gray-200 text-center text-gray-600 text-xs py-2 font-bold rounded-lg capitalize">
            Pendiente
          </div>
        )}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {String(operación?.añadida)}
      </td>
      <td className="px-6 py-3 border border-slate-300">
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
              Editar operación
            </button>
            <EditModal
              operación={operación}
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
              Eliminar operación
            </button>
            <DeleteModal
              operación={operación}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "VIEW_ASSOCIATED_PRODUCTOS" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg">
            Mostrar productos asociados
          </button>
        )}
      </td>
    </tr>
  );
}

function Dropup({
  close,
  selectAction,
  openAddModal,
  openSearchModal,
}: DropupProps) {
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
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
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
            Editar operación
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
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
            Eliminar operación
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        (permissions.find()?.editar.ticket &&
          permissions.find()?.eliminar.ticket)) && (
        <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        session.find()?.usuario.rol === "SUPERADMINISTRADOR" ||
        permissions.find()?.crear.ticket) && (
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
            Añadir operación
          </div>
        </li>
      )}
      <li>
        <div
          onClick={() => {
            openSearchModal?.();
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
          Buscar operación
        </div>
      </li>
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
  const tempInput = useOperationSearchParamStore((state) => state.tempInput);
  const secondTempInput = useOperationSearchParamStore(
    (state) => state.secondTempInput
  );
  const setInput = useOperationSearchParamStore((state) => state.setInput);
  const setTempInput = useOperationSearchParamStore(
    (state) => state.setTempInput
  );
  const setSecondInput = useOperationSearchParamStore(
    (state) => state.setSecondInput
  );
  const setSecondTempInput = useOperationSearchParamStore(
    (state) => state.setSecondTempInput
  );
  const setParam = useOperationSearchParamStore((state) => state.setParam);
  const setSecondParam = useOperationSearchParamStore(
    (state) => state.setSecondParam
  );
  const incrementSearchCount = useOperationSearchParamStore(
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
        <h1 className="text-xl font-bold text-white">Buscar operación</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
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
                label: "Fecha añadida",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "INICIADO",
                label: "Fecha iniciada",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "COMPLETADO",
                label: "Fecha completada",
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
                  value: "AÑADIDA",
                  label: "Añadida",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "INICIADA",
                  label: "Iniciada",
                  onClick: (value, label) => {
                    setSelectedState({
                      value,
                      label,
                    });
                  },
                },
                {
                  value: "COMPLETADA",
                  label: "Completada",
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
            />
          </>
        ) : null}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
            Buscar
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default function OperationsDataDisplay() {
  const { id, service_id } = useParams();
  const [operations, setOperations] = useState<Operación[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>("NONE");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useOperationSearchParamStore(
    (state) => state.searchCount
  );
  const resetSearchCount = useOperationSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useOperationSearchParamStore((state) => state.input);
  const param = useOperationSearchParamStore((state) => state.param);
  const secondInput = useOperationSearchParamStore(
    (state) => state.secondInput
  );
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

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  const setAsCompleted = () => {
    setIsOperationCompleted(true);
  };

  useEffect(() => {
    if (searchCount === 0 || isOperationCompleted) {
      OperationService.getAll(Number(id), Number(service_id), page, 8).then(
        (data) => {
          if (data === false) {
            setNotFound(true);
            setLoading(false);
            setOperations([]);
            resetSearchCount();
            setWasSearch(false);
          } else {
            setOperations(data.rows);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
            setNotFound(false);
            resetSearchCount();
            setWasSearch(false);
          }
          setIsOperationCompleted(false);
        }
      );
    } else {
      if (wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        if (param === "AÑADIDO") {
          OperationService.getBetweenAñadida(
            Number(id),
            Number(service_id),
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            8
          ).then((data) => {
            if (data === false) {
              setOperations([]);
              setNotFound(true);
              setLoading(false);
            } else {
              setOperations(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "INICIADO") {
          OperationService.getBetweenInicial(
            Number(id),
            Number(service_id),
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            8
          ).then((data) => {
            if (data === false) {
              setOperations([]);
              setNotFound(true);
              setLoading(false);
            } else {
              setOperations(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "COMPLETADO") {
          OperationService.getBetweenCompletada(
            Number(id),
            Number(service_id),
            new Date(input).toISOString().split("T")[0],
            new Date(secondInput).toISOString().split("T")[0],
            page,
            8
          ).then((data) => {
            if (data === false) {
              setOperations([]);
              setNotFound(true);
              setLoading(false);
            } else {
              setOperations(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "ESTADO") {
          OperationService.getByState(
            Number(id),
            Number(service_id),
            input,
            page,
            8
          ).then((data) => {
            if (data === false) {
              setOperations([]);
              setNotFound(true);
              setLoading(false);
            } else {
              setOperations(data.rows);
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
            Menu <Right className="w-3 h-3 inline fill-slate-600" /> Tickets{" "}
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">{id}</span>{" "}
            <Right className="w-3 h-3 inline fill-slate-600" /> Servicios{" "}
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">{service_id}</span>{" "}
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]" onClick={resetSearchCount}>
              Operaciones
            </span>
          </div>
          <div>
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={openAddModal}
                openSearchModal={() => {
                  setIsSearch(true);
                }}
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
        {operations.length > 0 && loading == false && (
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
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Añadida
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {operations.map((operation) => {
                  return (
                    <DataRow
                      action={action}
                      operación={operation}
                      setOperationAsCompleted={setAsCompleted}
                      key={operation.id}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true ||
          (operations.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5 text-slate-600">
            <div className="place-self-center flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningúna operación encontrada
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningúna operación registrada."
                  : "Esto puede deberse a un error del servidor, o a que ningúna operación concuerda con tu busqueda"}
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
      {operations.length > 0 && loading == false && (
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
