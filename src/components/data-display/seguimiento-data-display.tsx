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
  Seguimiento,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import ElementService from "../../services/element-service";
import permissions from "../../utils/permissions";
import session from "../../utils/session";
import { useParams } from "react-router-dom";
import { format } from "date-fns";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const { id, elemento_id } = useParams();
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Seguimiento>({
    recibido: new Date(),
    notas_de_recibo: "",
    elemento_id: Number(elemento_id),
  });

  const resetFormData = () => {
    setFormData({
      recibido: new Date(),
      notas_de_recibo: "",
      elemento_id: Number(elemento_id),
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
      className="w-2/5 h-fit rounded-md shadow-md"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Registrar recibo</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Registrando recibo...");
          ElementService.createSeguimiento(
            Number(id),
            Number(elemento_id),
            formData
          ).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Recibo no pudo ser registrado.");
            } else {
              toast.success("Recibo registrado con exito.");
            }
          });
        }}
      >
        <input
          type="date"
          placeholder="Fecha de recibo"
          value={format(formData.recibido || new Date(), "yyyy-MM-dd")}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          onChange={(e) => {
            setFormData({
              ...formData,
              recibido: new Date(e.target.value),
            });
          }}
          required
        />
        <textarea
          rows={3}
          placeholder="Notas de recibo"
          onChange={(e) => {
            setFormData({
              ...formData,
              notas_de_recibo: e.target.value,
            });
          }}
          value={formData.notas_de_recibo}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
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

function AddEntregaModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
}: ModalProps) {
  const { id, elemento_id } = useParams();
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Seguimiento>({
    entregado: undefined,
    notas_de_entrega: "",
  });

  const resetFormData = () => {
    setFormData({
      entregado: undefined,
      notas_de_entrega: "",
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
      className="w-2/5 h-fit rounded-md shadow-md"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Registrar entrega</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Registrando entrega...");
          ElementService.createSeguimiento(
            Number(id),
            Number(elemento_id),
            formData
          ).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Entrega no pudo ser registrada.");
            } else {
              toast.success("Entrega registrada con exito.");
            }
          });
        }}
      >
        <input
          type="date"
          placeholder="Fecha de entrega"
          value={format(formData.entregado || new Date(), "yyyy-MM-dd")}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          onChange={(e) => {
            setFormData({
              ...formData,
              entregado: new Date(e.target.value),
            });
          }}
          required
        />
        <textarea
          rows={3}
          placeholder="Notas de entrega"
          onChange={(e) => {
            setFormData({
              ...formData,
              notas_de_entrega: e.target.value,
            });
          }}
          value={formData.notas_de_entrega}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
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

function EditReciboModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  seguimiento,
}: ModalProps) {
  const { id, elemento_id } = useParams();
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Seguimiento>(seguimiento!);

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
      className="w-2/5 h-fit rounded-md shadow-md text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar recibo</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando recibo...");
          ElementService.updateSeguimiento(
            seguimiento?.id!,
            formData,
            Number(id),
            Number(elemento_id)
          ).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data) {
              toast.success("Recibo editado con exito.");
            } else {
              toast.error("Recibo no pudo ser editado.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        <input
          type="date"
          placeholder="Fecha de recibo"
          value={format(formData.recibido || new Date(), "yyyy-MM-dd")}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          onChange={(e) => {
            setFormData({
              ...formData,
              recibido: new Date(e.target.value),
            });
          }}
          required
        />
        <textarea
          rows={3}
          placeholder="Notas de recibo"
          onChange={(e) => {
            setFormData({
              ...formData,
              notas_de_recibo: e.target.value,
            });
          }}
          value={formData.notas_de_recibo}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
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

function EditEntregaModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  seguimiento,
}: ModalProps) {
  const { id, elemento_id } = useParams();
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Seguimiento>(seguimiento!);

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
      className="w-2/5 h-fit rounded-md shadow-md text-base"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar entrega</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando entrega...");
          ElementService.updateSeguimiento(
            seguimiento?.id!,
            formData,
            Number(id),
            Number(elemento_id)
          ).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data) {
              toast.success("Entrega editada con exito.");
            } else {
              toast.error("Entrega no pudo ser editada.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        <input
          type="date"
          placeholder="Fecha de entrega"
          value={format(formData.entregado || new Date(), "yyyy-MM-dd")}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          onChange={(e) => {
            setFormData({
              ...formData,
              entregado: new Date(e.target.value),
            });
          }}
          required
        />
        <textarea
          rows={3}
          placeholder="Notas de recibo"
          onChange={(e) => {
            setFormData({
              ...formData,
              notas_de_recibo: e.target.value,
            });
          }}
          value={formData.notas_de_recibo}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
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
  seguimiento,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const { id, elemento_id } = useParams();

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
          const loadingToast = toast.loading("Eliminando recibo y entrega...");
          ElementService.deleteSeguimiento(
            seguimiento?.id!,
            Number(id),
            Number(elemento_id)
          ).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Recibo y entrega eliminado con exito.");
            } else {
              toast.error("Recibo y entrega no pudo ser eliminado.");
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

function DataRow({
  action,
  seguimiento,
  setOperationAsCompleted,
}: DataRowProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditReciboOpen, setIsEditReciboOpen] = useState(false);
  const [isEditEntregaOpen, setIsEditEntregaOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const closeEditReciboModal = () => {
    setIsEditReciboOpen(false);
  };

  const closeEditEntregaModal = () => {
    setIsEditEntregaOpen(false);
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
        {seguimiento?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300">
        {format(new Date(seguimiento?.recibido!), "dd/MM/yyyy")}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {seguimiento?.entregado
          ? format(new Date(seguimiento?.entregado!), "dd/MM/yyyy")
          : "Nunca"}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {seguimiento?.entregable_desde
          ? format(new Date(seguimiento?.entregable_desde!), "dd/MM/yyyy")
          : "Nunca"}
      </td>
      <td className="px-6 py-3 border border-slate-300 w-[250px]">
        {action === "NONE" && (
          <button className="font-medium text-[#2096ed] dark:text-blue-500 italic cursor-not-allowed">
            Ninguna seleccionada
          </button>
        )}
        {action === "ADD_ENTREGA" && (
          <>
            <button
              onClick={() => {
                setIsEditReciboOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Registrar entrega
            </button>
            <AddEntregaModal
              seguimiento={seguimiento}
              isOpen={isAddOpen}
              closeModal={() => setIsAddOpen(false)}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "EDIT_RECIBO" && (
          <>
            <button
              onClick={() => {
                setIsEditReciboOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar recibo
            </button>
            <EditReciboModal
              seguimiento={seguimiento}
              isOpen={isEditReciboOpen}
              closeModal={closeEditReciboModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "EDIT_ENTREGA" && (
          <>
            <button
              onClick={() => {
                setIsEditEntregaOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar entrega
            </button>
            <EditEntregaModal
              seguimiento={seguimiento}
              isOpen={isEditEntregaOpen}
              closeModal={closeEditEntregaModal}
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
              Eliminar recibo y entrega
            </button>
            <DeleteModal
              seguimiento={seguimiento}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
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
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.crear.cliente) && (
        <li>
          <div
            onClick={() => {
              selectAction("ADD_ENTREGA");
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
            Registrar entrega
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.editar.cliente) && (
        <li>
          <div
            onClick={() => {
              selectAction("EDIT_RECIBO");
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
            Editar recibo
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.editar.cliente) && (
        <li>
          <div
            onClick={() => {
              selectAction("EDIT_ENTREGA");
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
            Editar entrega
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.editar.cliente) && (
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
            Marcar como entregable
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.eliminar.cliente) && (
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
            Eliminar recibo y entrega
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        (permissions.find()?.editar.cliente &&
          permissions.find()?.eliminar.cliente)) && (
        <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.crear.cliente) && (
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
            Registrar recibo
          </div>
        </li>
      )}
    </ul>
  );
}

export default function SeguimientosDataDisplay() {
  const { id, elemento_id } = useParams();
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
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

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  const setAsCompleted = () => {
    setIsOperationCompleted(true);
  };

  useEffect(() => {
    ElementService.getSeguimientos(
      Number(id),
      Number(elemento_id),
      page,
      8
    ).then((data) => {
      if (data === false) {
        setNotFound(true);
        setSeguimientos([]);
        setLoading(false);
      } else {
        setSeguimientos(data.rows);
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
      <div className="absolute h-full w-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menu <Right className="w-3 h-3 inline fill-slate-600" /> Clientes{" "}
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed] cursor-pointer">{id}</span>
            <Right className="w-3 h-3 inline fill-slate-600" /> Elementos{" "}
            <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed] cursor-pointer">{elemento_id}</span>{" "}
            <Right className="w-3 h-3 inline fill-slate-600" /> Seguimiento
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
        {seguimientos.length > 0 && loading == false && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Recibido en
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Entregado en
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Entregable desde
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {seguimientos.map((seguimiento) => {
                  return (
                    <DataRow
                      action={action}
                      seguimiento={seguimiento}
                      setOperationAsCompleted={setAsCompleted}
                      key={seguimiento.id}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true ||
          (seguimientos.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún recibo y entrega encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                Esto puede deberse a un error del servidor, o a que no se haya
                creado ningún seguimiento para este elemento.
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
      {seguimientos.length > 0 && loading == false && (
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
