import { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Rol,
  Selected,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import Select from "../misc/select";
import permissions from "../../utils/permissions";
import { useRolSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import clsx from "clsx";
import RolService from "../../services/rol-service";
import { INICIALES } from "../../utils/data";
import debounce from "lodash.debounce";
import { createRowNumber } from "../../utils/functions";

type PermissionPanelProps = {
  onChange: (rol: Partial<Rol>) => void;
  rol: Rol;
};

const categories = [
  { name: "Usuarios", key: "usuario" },
  { name: "Clientes", key: "cliente" },
  { name: "Tickets", key: "ticket" },
  { name: "Mensajes", key: "mensaje" },
  { name: "Publicaciones", key: "publicación" },
  { name: "Productos", key: "producto" },
  { name: "Proveedores", key: "proveedor" },
  { name: "Ventas", key: "venta" },
  { name: "Compras", key: "compra" },
  { name: "Categorías", key: "categoría" },
  { name: "Galería", key: "imagen" },
  { name: "Impuestos", key: "impuesto" },
  { name: "Mensajería", key: "mensajería" },
  { name: "Roles", key: "rol" },
  { name: "Restauración", key: "restauracion" },
  { name: "Historico", key: "historico"}
];

const actions = ["ver", "crear", "editar", "eliminar"];

const customConfig: Record<
  string,
  { actions?: string[]; actionLabels?: Record<string, string> }
> = {
  compra: {
    actions: ["ver", "crear", "eliminar"],
    actionLabels: { eliminar: "anular" },
  },
  venta: {
    actions: ["ver", "crear", "eliminar"],
    actionLabels: { eliminar: "anular" },
  },
  restauracion: {
    actions: ["crear"],
    actionLabels: { crear: "gestionar" },
  },
  mensajería: {
    actions: ["ver", "editar"],
  },
  historico: {
    actions: ["ver"],
  },
};

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  rol,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [formData, setFormData] = useState<Rol>(rol!);
  const [nameExist, setNameExist] = useState(false);
  const [stillWritingName, setStillWritingName] = useState(false);

  const resetFormData = () => {
    setFormData(rol!);
    setIsConfirmationScreen(false);
  };

  const handlePermissionChange = (updatedPermissions: Partial<Rol>) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedPermissions,
    }));
  };

  const checkName = useCallback(
    debounce(async (nombre) => {
      if (nombre.length >= 1) {
        const exist = await RolService.getByExactNombre(nombre, 1, 100);
        if (exist && rol?.nombre !== nombre) {
          setNameExist(true);
          setStillWritingName(false);
        } else {
          setNameExist(false);
          setStillWritingName(false);
        }
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkName(formData.nombre);
  }, [formData.nombre]);

  useEffect(() => {
    if (isOpen) {
      ref.current?.showModal();
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeModal();
          setIsConfirmationScreen(false);
          ref.current?.close();
        }
      });
    } else {
      closeModal();
      setIsConfirmationScreen(false);
      ref.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const loadingToast = toast.loading("Editando rol...");
    void RolService.update(rol?.id!, formData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
  };

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Datos actuales
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {rol?.nombre}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">
                  Permisos
                </p>
                <div className="max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100 scrollbar-rounded-xl">
                  {categories.map((category) => {
                    const config = customConfig[category.key] || {};
                    const availableActions = config.actions || actions;
                    return (
                      <div key={category.key} className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {category.name}
                        </p>
                        <div className="flex gap-3">
                          {availableActions.map((action) => (
                            <span
                              key={action}
                              className={`text-sm ${
                                //@ts-ignore
                                rol![action]?.[category.key]
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {action.toUpperCase()}:{" "}
                              {
                                //@ts-ignore
                                rol![action]?.[category.key] ? "✓" : "✗"
                              }
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Nuevos datos
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.nombre !== rol?.nombre
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.nombre}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">
                  Permisos
                </p>
                <div className="max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100 scrollbar-rounded-xl">
                  {categories.map((category) => {
                    const config = customConfig[category.key] || {};
                    const availableActions = config.actions || actions;
                    return (
                      <div key={category.key} className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {category.name}
                        </p>
                        <div className="flex gap-3">
                          {availableActions.map((action) => {
                            const hasChanged =
                              //@ts-ignore
                              rol![action]?.[category.key] !==
                              //@ts-ignore
                              formData[action]?.[category.key];
                            return (
                              <span
                                key={action}
                                className={`text-sm ${
                                  hasChanged
                                    ? "text-blue-600 font-semibold"
                                    : //@ts-ignore
                                    formData[action]?.[category.key]
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {action.toUpperCase()}:{" "}
                                {
                                  //@ts-ignore
                                  formData[action]?.[category.key] ? "✓" : "✗"
                                }
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
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
          Guardar cambios
        </button>
      </div>
    </div>
  );

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar rol</h1>
      </div>
      {isConfirmationScreen ? (
        renderConfirmationScreen()
      ) : (
        <form
          className="flex flex-col p-8 pt-6 gap-4 group"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Nombre<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  nombre: e.target.value,
                });
                setStillWritingName(true);
              }}
              value={formData.nombre}
              placeholder="Introducir nombre"
              className={clsx({
                ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                  !nameExist,
                ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                  nameExist,
              })}
              required
              pattern="^.{1,100}$"
              name="nombre"
            />
            <span
              className={clsx({
                ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                  !nameExist,
                ["mt-2 text-sm text-red-500 block"]: nameExist,
              })}
            >
              {nameExist
                ? "Este rol ya está registrado"
                : "Minimo 1 carácter, máximo 100"}
            </span>
          </div>
          <PermissionPanel
            onChange={(updatedPermissions) => {
              handlePermissionChange(updatedPermissions);
            }}
            rol={formData}
          />
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
                  !nameExist,
                ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  nameExist || stillWritingName,
              })}
            >
              Completar
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [formData, setFormData] = useState<Rol>({
    nombre: "",
    ver: INICIALES.ver,
    crear: INICIALES.crear,
    editar: INICIALES.editar,
    eliminar: INICIALES.eliminar,
  });
  const [nameExist, setNameExist] = useState(false);
  const [stillWritingName, setStillWritingName] = useState(false);

  const resetFormData = () => {
    setFormData({
      nombre: "",
      ver: INICIALES.ver,
      crear: INICIALES.crear,
      editar: INICIALES.editar,
      eliminar: INICIALES.eliminar,
    });
    setIsConfirmationScreen(false);
  };

  const handlePermissionChange = (updatedPermissions: Partial<Rol>) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedPermissions,
    }));
  };

  const checkName = useCallback(
    debounce(async (nombre) => {
      if (nombre.length >= 1) {
        const exist = await RolService.getByExactNombre(nombre, 1, 100);
        if (exist) {
          setNameExist(true);
          setStillWritingName(false);
        } else {
          setNameExist(false);
          setStillWritingName(false);
        }
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkName(formData.nombre);
  }, [formData.nombre]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const loadingToast = toast.loading("Añadiendo rol...");
    void RolService.create(formData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
  };

  const renderConfirmationScreen = () => {
    const renderPermissionSection = (category: any, permissions: any) => {
      const availableActions = customConfig[category.key]?.actions || actions;
      const actionLabels = customConfig[category.key]?.actionLabels || {};

      return (
        <div key={category.key} className="mb-4">
          <p className="text-xs uppercase tracking-wider font-semibold mb-1">
            {category.name}
          </p>
          <div className="flex gap-3">
            {availableActions.map((action) => (
              <span
                key={action}
                className={`text-sm ${
                  permissions[action]?.[category.key]
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {(actionLabels[action] || action).toUpperCase()}:{" "}
                {permissions[action]?.[category.key] ? "✓" : "✗"}
              </span>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Nombre del Rol
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {formData.nombre}
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">
                Permisos
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) =>
                  renderPermissionSection(category, formData)
                )}
              </div>
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
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen ? "Confirmar rol" : "Añadir rol"}
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
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Nombre<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  nombre: e.target.value,
                });
                setStillWritingName(true);
              }}
              value={formData.nombre}
              placeholder="Introducir nombre"
              className={clsx({
                ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                  !nameExist,
                ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                  nameExist,
              })}
              required
              pattern="^.{1,100}$"
              name="nombre"
            />
            <span
              className={clsx({
                ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                  !nameExist,
                ["mt-2 text-sm text-red-500 block"]: nameExist,
              })}
            >
              {nameExist
                ? "Este rol ya está registrado"
                : "Minimo 1 carácter, máximo 100"}
            </span>
          </div>
          <PermissionPanel
            onChange={(updatedPermissions) => {
              handlePermissionChange(updatedPermissions);
            }}
            rol={formData}
          />
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
                  !nameExist,
                ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  nameExist || stillWritingName,
              })}
            >
              Completar
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

function DeleteModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  rol,
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Eliminar rol</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando rol...");
          RolService.delete(rol?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data.status === "success") {
              toast.success(data.message);
            } else {
              toast.error(data.message);
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
            Continuar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function ViewModal({ isOpen, closeModal, rol }: ModalProps) {
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

  const renderPermissionSection = (category: any, permissions: any) => {
    const availableActions = customConfig[category.key]?.actions || actions;
    const actionLabels = customConfig[category.key]?.actionLabels || {};

    return (
      <div key={category.key} className="mb-4">
        <p className="text-xs uppercase tracking-wider font-semibold mb-1">
          {category.name}
        </p>
        <div className="flex gap-3">
          {availableActions.map((action) => (
            <span
              key={action}
              className={`text-sm ${
                permissions[action]?.[category.key]
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {(actionLabels[action] || action).toUpperCase()}:{" "}
              {permissions[action]?.[category.key] ? "✓" : "✗"}
            </span>
          ))}
        </div>
      </div>
    );
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Datos del rol</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Nombre del Rol
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {rol?.nombre}
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">
                Permisos
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) =>
                  renderPermissionSection(category, rol)
                )}
              </div>
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

function PermissionPanel({ onChange, rol: initialRol }: PermissionPanelProps) {
  const [rol, setRol] = useState<Rol>({ ...initialRol });

  useEffect(() => {
    onChange({
      ver: rol.ver,
      crear: rol.crear,
      editar: rol.editar,
      eliminar: rol.eliminar,
    });
  }, [rol]);

  const handlePermissionChange = (
    action: keyof Rol,
    category: string,
    checked: boolean
  ) => {
    setRol((prev) => ({
      ...prev,
      [action]: {
        //@ts-ignore
        ...prev[action],
        [category]: checked,
      },
    }));
  };

  return (
    <div className="max-h-[300px] overflow-auto scrollbar-thin scrollbar-rounded-xl text-sm">
      {categories.map((category) => {
        const config = customConfig[category.key] || {};
        const availableActions = config.actions || actions;
        const actionLabels = config.actionLabels || {};

        return (
          <div key={category.key}>
            <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
              {category.name}
            </div>
            <div className="ml-5 mt-2 flex gap-4">
              {availableActions.map((action) => (
                <div
                  key={action}
                  className="mb-[0.125rem] min-h-[1.5rem] block"
                >
                  <input
                    className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
                    type="checkbox"
                    id={`${action}-${category.key}`}
                    onChange={(e) =>
                      handlePermissionChange(
                        action as keyof Rol,
                        category.key,
                        e.target.checked
                      )
                    }
                    //@ts-ignore
                    checked={rol[action]?.[category.key] || false}
                  />
                  <label
                    className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
                    htmlFor={`${action}-${category.key}`}
                  >
                    {actionLabels[action]
                      ? actionLabels[action].toUpperCase()
                      : action.toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const setIsPrecise = useRolSearchParamStore((state) => state.setIsPrecise);
  const setTempIsPrecise = useRolSearchParamStore(
    (state) => state.setTempIsPrecise
  );
  const tempIsPrecise = useRolSearchParamStore((state) => state.tempIsPrecise);
  const tempInput = useRolSearchParamStore((state) => state.tempInput);
  const setInput = useRolSearchParamStore((state) => state.setInput);
  const setTempInput = useRolSearchParamStore((state) => state.setTempInput);
  const setParam = useRolSearchParamStore((state) => state.setParam);
  const incrementSearchCount = useRolSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);

  const resetSearch = () => {
    setTempInput("");
    setTempIsPrecise(false);
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de busqueda",
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Buscar rol</h1>
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
                value: "NOMBRE",
                label: "Nombre",
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
        <input
          type="text"
          placeholder={
            selectedSearchType.value === "CÓDIGO"
              ? "Introduzca código del rol"
              : selectedSearchType.value === "NOMBRE"
              ? "Introduzca nombre del rol"
              : ""
          }
          value={tempInput}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          onChange={(e) => {
            setInput(e.target.value);
            setTempInput(e.target.value);
          }}
          required
        />
        <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
            <input
              className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox"
              onChange={(e) => {
                setIsPrecise(e.target.checked);
                setTempIsPrecise(e.target.checked);
              }}
              checked={tempIsPrecise}
              id="checkbox"
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox"
            >
              ¿Busqueda exacta?
            </label>
          </div>
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
                  selectedSearchType.label?.startsWith("Seleccionar"),
                ["group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  true,
              })}
            >
              Buscar
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function DataRow({ rol, setOperationAsCompleted, row_number }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.rol
      ? "EDIT"
      : permissions.find()?.eliminar.rol
      ? "DELETE"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    permissions.find()?.editar.rol || permissions.find()?.eliminar.rol;

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
    <tr className="font-semibold">
      <th
        scope="row"
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 w-[50px]"
      >
        {row_number}
      </th>
      <td className="px-6 py-4 border border-slate-300">{rol?.nombre}</td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 min-w-[200px] w-[200px] relative"
      >
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
              Editar rol
            </button>
            <EditModal
              rol={rol}
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
              Eliminar rol
            </button>
            <DeleteModal
              rol={rol}
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
              Mostrar rol
            </button>
            <ViewModal
              rol={rol}
              isOpen={isViewOpen}
              closeModal={closeViewModal}
              setOperationAsCompleted={() => null}
            />
          </>
        )}
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => null}
            openSearchModal={() => null}
            id={rol?.id}
            top={
              (ref?.current?.getBoundingClientRect().top ?? 0) +
              (window.scrollY ?? 0) +
              (ref?.current?.getBoundingClientRect().height ?? 0) -
              10
            }
            left={
              (ref?.current?.getBoundingClientRect().left ?? 0) +
              window.scrollX +
              70
            }
          />
        )}
        {anyAction ? (
          <button
            id={`acciones-btn-${rol?.id}`}
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
          shadow-lg
          mt-2
          m-0
          bg-clip-padding
          border
        "
    >
      {permissions.find()?.crear.rol && (
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
            Añadir rol
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
          Buscar rol
        </div>
      </li>
    </ul>
  );
}

function IndividualDropup({ id, close, selectAction, top, left }: DropupProps) {
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
      style={{ top: top, left }}
    >
      {permissions.find()?.editar.rol && (
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
            Editar rol
          </div>
        </li>
      )}
      {permissions.find()?.eliminar.rol && (
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
            Eliminar rol
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
          Mostrar rol
        </div>
      </li>
    </ul>
  );
}

export default function RolsDataDisplay() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.crear.categoría ? "ADD" : "SEARCH"
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useRolSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useRolSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useRolSearchParamStore((state) => state.input);
  const param = useRolSearchParamStore((state) => state.param);
  const isPrecise = useRolSearchParamStore((state) => state.isPrecise);
  const setIsPrecise = useRolSearchParamStore((state) => state.setIsPrecise);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const [isSearch, setIsSearch] = useState(false);
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

  const selectAction = (action: `${Action}`) => {
    setAction(action);
  };

  const setAsCompleted = () => {
    setIsOperationCompleted(true);
  };

  useEffect(() => {
    if (searchCount === 0) {
      RolService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setRoles([]);
          setLoading(false);
          resetSearchCount();
          setWasSearch(false);
        } else {
          setRoles(data.rows);
          setPages(data.pages);
          setCurrent(data.current);
          setLoading(false);
          resetSearchCount();
          setWasSearch(false);
          setNotFound(false);
        }
        setIsOperationCompleted(false);
      });
    } else {
      if (isPrecise && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        if (param === "NOMBRE") {
          RolService.getByExactNombre(input, page, size).then((data) => {
            toast.dismiss(loadingToast);
            if (data === false) {
              setNotFound(true);
              setRoles([]);
              setLoading(false);
            } else {
              setRoles(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
            }
            setIsPrecise(false)
            setIsOperationCompleted(false);
          });
        }
      } else if (!isPrecise && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        if (param === "NOMBRE") {
          RolService.getByNombre(input, page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setRoles([]);
              setLoading(false);
            } else {
              setRoles(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
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
      <div className="absolute h-full w-full px-12 py-5">
        <nav className="flex justify-between items-center select-none max-[380px]:flex-col gap-4">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-600" />{" "}
            <span
              onClick={resetSearchCount}
              className="text-[#2096ed] cursor-pointer"
            >
              Roles
            </span>
          </div>
          <div className="flex gap-2 relative">
            {isDropup && (
              <Dropup
                close={closeDropup}
                selectAction={selectAction}
                openAddModal={() => {}}
              />
            )}
            {action === "ADD" ? (
              <button
                onClick={openAddModal}
                className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
              >
                Añadir rol
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
                  Buscar rol
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
        {roles.length > 0 && loading == false && (
          <div className="relative overflow-x-auto scrollbar-thin">
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
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.map((rol, index) => {
                  return (
                    <DataRow
                      action={""}
                      rol={rol}
                      setOperationAsCompleted={setAsCompleted}
                      key={rol.id}
                      row_number={createRowNumber(current, size, index + 1)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true || (roles.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún rol encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningún rol registrado."
                  : "Esto puede deberse a un error del servidor, o a que ningún rol concuerda con tu busqueda."}
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
      {roles.length > 0 && loading == false && (
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
