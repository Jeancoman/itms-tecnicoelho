import { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "/src/assets/chevron-down-solid.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Usuario,
  Selected,
  Rol,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import UserService from "../../services/user-service";
import Select from "../misc/select";
import { useUserSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import { ReactComponent as On } from "/src/assets/visibility.svg";
import { ReactComponent as Off } from "/src/assets/visibility_off.svg";
import session from "../../utils/session";
import debounce from "lodash.debounce";
import clsx from "clsx";
import RolService from "../../services/rol-service";
import permissions from "../../utils/permissions";
import { useNavigate } from "react-router-dom";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [selectedRole, setSelectedRole] = useState<Selected>({
    value: "",
    label: "Seleccionar rol",
  });
  const [formData, setFormData] = useState<Usuario>({
    nombre: "",
    apellido: "",
    correo: "",
    nombreUsuario: "",
    documento: "",
    contraseña: "",
    creado_por: {
      lista: [],
    },
    rol_id: -1,
  });
  const [documentType, setDocumentType] = useState<Selected>({
    value: "V",
    label: "V",
  });
  const [visible, setVisible] = useState(false);
  const [isTaken, setIsTaken] = useState(false);
  const [stillWriting, setStillWriting] = useState(false);

  const resetFormData = () => {
    setFormData({
      nombre: "",
      apellido: "",
      nombreUsuario: "",
      contraseña: "",
      correo: "",
      creado_por: {
        lista: [],
      },
      documento: "",
      rol_id: -1,
    });
    setSelectedRole({
      value: "",
      label: "Seleccionar rol",
    });
    setDocumentType({ value: "V", label: "V" });
    setIsConfirmationScreen(false);
    setVisible(false)
  };

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const exist = await UserService.getByExactNombreUsuario(
          username,
          1,
          100
        );
        if (exist) {
          setIsTaken(true);
          setStillWriting(false);
        } else {
          setIsTaken(false);
          setStillWriting(false);
        }
      }
    }, 500),
    []
  );

  const loadRoles = async () => {
    const data = await RolService.getAll(1, 100);
    if (data) {
      setRoles(data.rows);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    let lista = session.find()?.usuario.creado_por?.lista || [];

    if (!lista?.find((id) => id === session.find()?.usuario.id)) {
      lista?.push(session.find()?.usuario.id!);
    }

    const newFormData = { ...formData };

    //@ts-ignore
    newFormData.creado_por = {
      lista: lista,
    };

    // Formatear el documento según el tipo seleccionado
    if (formData.documento) {
      newFormData.documento = `${documentType.value}-${formData.documento}`;
    }

    const loadingToast = toast.loading("Añadiendo usuario...");

    void UserService.create(newFormData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
  };

  // Define una función para obtener el patrón y el mensaje de error según el tipo de documento
  const getDocumentoPatternAndMessage = () => {
    switch (documentType.value) {
      case "V":
      case "E":
        return {
          pattern: /^(\d{8}|\d{8}-\d{1})$/,
          message: "Formato válido: 12345678 o 12345678-0",
        };
      case "G":
      case "J":
        return {
          pattern: /^\d{8}-\d{1}$/,
          message: "Formato válido: 12345678-0",
        };
      case "P":
        return {
          pattern: /^\d{8}$/,
          message: "Formato válido: 12345678",
        };
      default:
        return {
          pattern: /^.*$/, // Acepta cualquier formato por defecto
          message: "Formato inválido",
        };
    }
  };

  useEffect(() => {
    checkUsername(formData.nombreUsuario);
  }, [formData.nombreUsuario]);

  useEffect(() => {
    if (roles.length === 0) {
      void loadRoles();
    }
  }, [roles.length]);

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

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Columna 1 */}
          <div>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Nombre
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {formData.nombre || "No especificado"}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Nombre de usuario
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {formData.nombreUsuario || "No especificado"}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Documento
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {documentType.value}-{formData.documento}
              </p>
            </div>
          </div>

          {/* Columna 2 */}
          <div>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Apellido
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {formData.apellido || "No especificado"}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Rol
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {selectedRole?.label || "No especificado"}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                E-mail
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {formData.correo || "No especificado"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
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
          Crear usuario
        </button>
      </div>
    </div>
  );

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen ? "Confirmar usuario" : "Añadir usuario"}
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
          <div className="flex gap-4 w-full">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Nombre*
              </label>
              <input
                type="text"
                placeholder="Introducir nombre"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  });
                }}
                value={formData.nombre}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                pattern="^.{2,}$"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 2 caracteres
              </span>
            </div>
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Apellido*
              </label>
              <input
                type="text"
                placeholder="Introducir apellido"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    apellido: e.target.value,
                  });
                }}
                value={formData.apellido}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                pattern="^.{2,}$"
                required
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 2 caracteres
              </span>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Documento*
            </label>
            <div className="flex gap-1">
              <div className="relative w-[20%]">
                <Select
                  options={[
                    {
                      value: "V",
                      label: "V",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "J",
                      label: "J",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "G",
                      label: "G",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "E",
                      label: "E",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "P",
                      label: "P",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                  ]}
                  selected={documentType}
                  small
                />
              </div>
              <div className="w-[80%]">
                <input
                  type="text"
                  placeholder="Documento"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      documento: e.target.value,
                    });
                  }}
                  value={formData.documento}
                  required
                  className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                  pattern={getDocumentoPatternAndMessage().pattern.source}
                />
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                  {getDocumentoPatternAndMessage().message}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Nombre de usuario*
              </label>
              <input
                type="text"
                placeholder="Introducir nombre de usuario"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    nombreUsuario: e.target.value.toLowerCase(),
                  });
                  setStillWriting(true);
                }}
                value={formData.nombreUsuario}
                className={clsx({
                  ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                    !isTaken,
                  ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                    isTaken,
                })}
                required
                minLength={3}
              />
              <span
                className={clsx({
                  ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                    !isTaken,
                  ["mt-2 text-sm text-red-500 block"]: isTaken,
                })}
              >
                {isTaken
                  ? "El nombre de usuario ya existe"
                  : "Minimo 2 caracteres"}
              </span>
            </div>
            <div className="relative w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Rol*
              </label>
              <Select
                options={roles.map((rol) => ({
                  value: rol.id,
                  label: rol.nombre,
                  onClick: (value, label) => {
                    setSelectedRole({
                      value,
                      label,
                    });
                  },
                }))}
                onChange={() => {
                  setFormData({
                    ...formData,
                    rol_id: selectedRole.value as number,
                  });
                }}
                selected={selectedRole}
              />
            </div>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              E-mail*
            </label>
            <input
              type="email"
              name="email"
              placeholder="E-mail*"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  correo: e.target.value,
                });
              }}
              value={formData.correo}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              required
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              E-mail invalido
            </span>
          </div>
          <div className="relative w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Contraseña*
            </label>
            <input
              type={visible ? "text" : "password"}
              placeholder="Contraseña*"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contraseña: e.target.value,
                })
              }
              value={formData.contraseña}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              name="password"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              autoComplete="new-password"
              required
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              La contraseña debe tener mínimo 8 caracteres, contener una letra
              mayúscula, una letra minúscula, un número y un carácter especial
            </span>
            {visible ? (
              <On
                onClick={() => setVisible(false)}
                className="absolute top-10 right-4 fill-[#2096ed]"
              />
            ) : (
              <Off
                onClick={() => setVisible(true)}
                className="absolute top-10 right-4 fill-[#2096ed]"
              />
            )}
          </div>
          <div className="flex gap-2 justify-self-end justify-end">
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
                  !isTaken,
                ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  isTaken ||
                  stillWriting ||
                  formData?.nombre.length < 2 ||
                  formData?.nombreUsuario.length < 3 ||
                  selectedRole.label?.startsWith("Selecciona"),
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

function EditModal({
  isOpen,
  closeModal,
  setOperationAsCompleted,
  usuario,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Selected>({
    value: usuario?.rol?.id,
    label: usuario?.rol?.nombre,
  });
  const initialDocumentType = usuario?.documento
    ? usuario.documento.split("-")[0]
    : "V";
  const [documentType, setDocumentType] = useState<Selected>({
    value: initialDocumentType,
    label: initialDocumentType,
  });
  const initialDocumento = usuario?.documento
    ? usuario.documento.split("-").slice(1).join("-")
    : "";
  const [formData, setFormData] = useState<Usuario>({
    ...usuario!,
    contraseña: "",
    documento: initialDocumento,
  });
  const [visible, setVisible] = useState(false);
  const [isTaken, setIsTaken] = useState(false);
  const [stillWriting, setStillWriting] = useState(false);

  const resetFormData = () => {
    setFormData({
      ...usuario!,
      contraseña: "",
      documento: usuario?.documento
        ? usuario.documento.split("-").slice(1).join("-") // Extraer el documento sin el prefijo
        : "",
    });
    setSelectedRole({
      value: usuario?.rol?.id,
      label: usuario?.rol?.nombre,
    });
    setDocumentType({
      value: usuario?.documento?.charAt(0) || "V",
      label: usuario?.documento?.charAt(0) || "V",
    });
    setIsConfirmationScreen(false);
    setVisible(false);
  };

  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const exist = await UserService.getByExactNombreUsuario(
          username,
          1,
          100
        );
        if (exist && usuario?.nombreUsuario !== username) {
          setIsTaken(true);
          setStillWriting(false);
        } else {
          setIsTaken(false);
          setStillWriting(false);
        }
      }
    }, 500),
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();

    const newFormData = { ...formData };

    // Formatear el documento según el tipo seleccionado
    if (formData.documento) {
      newFormData.documento = `${documentType.value}-${formData.documento}`;
    }

    const loadingToast = toast.loading("Editando usuario...");
    void UserService.update(usuario?.id!, newFormData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "success") {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      setOperationAsCompleted();
    });
  };

  // Define una función para obtener el patrón y el mensaje de error según el tipo de documento
  const getDocumentoPatternAndMessage = () => {
    switch (documentType.value) {
      case "V":
      case "E":
        return {
          pattern: /^(\d{8}|\d{8}-\d{1})$/,
          message: "Formato válido: 12345678 o 12345678-0",
        };
      case "G":
      case "J":
        return {
          pattern: /^\d{8}-\d{1}$/,
          message: "Formato válido: 12345678-0",
        };
      case "P":
        return {
          pattern: /^\d{8}$/,
          message: "Formato válido: 12345678",
        };
      default:
        return {
          pattern: /^.*$/, // Acepta cualquier formato por defecto
          message: "Formato inválido",
        };
    }
  };

  useEffect(() => {
    checkUsername(formData.nombreUsuario);
  }, [formData.nombreUsuario]);

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

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA - Datos actuales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Datos actuales
            </h3>
            <div className="space-y-5">
              {/* Nombre */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.nombre || "No especificado"}
                </p>
              </div>
              {/* Apellido */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Apellido
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.apellido || "No especificado"}
                </p>
              </div>
              {/* Documento */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Documento
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.documento || "No especificado"}
                </p>
              </div>
              {/* Nombre de usuario */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre de usuario
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.nombreUsuario || "No especificado"}
                </p>
              </div>
              {/* Rol */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Rol
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.rol?.nombre || "No especificado"}
                </p>
              </div>
              {/* E-mail */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  E-mail
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.correo || "No especificado"}
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA - Nuevos datos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Nuevos datos
            </h3>
            <div className="space-y-5">
              {/* Nombre */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.nombre !== usuario?.nombre
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.nombre || "No especificado"}
                </p>
              </div>
              {/* Apellido */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Apellido
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.apellido !== usuario?.apellido
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.apellido || "No especificado"}
                </p>
              </div>
              {/* Documento */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Documento
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    // Ejemplo de comparación con prefijo
                    `${documentType.value}-${formData.documento}` !==
                    usuario?.documento
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {documentType.value}-{formData.documento}
                </p>
              </div>
              {/* Nombre de usuario */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre de usuario
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.nombreUsuario !== usuario?.nombreUsuario
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.nombreUsuario || "No especificado"}
                </p>
              </div>
              {/* Rol */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Rol
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    selectedRole?.value !== usuario?.rol?.id
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {selectedRole?.label || "No especificado"}
                </p>
              </div>
              {/* E-mail */}
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  E-mail
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.correo !== usuario?.correo
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.correo || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
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
      className="w-2/5 h-fit rounded-md shadow-md text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen
            ? session.find()?.usuario.id === usuario?.id
              ? "Confirmar cambios"
              : "Confirmar cambios"
            : session.find()?.usuario.id === usuario?.id
            ? "Editar tu usuario"
            : "Editar usuario"}
        </h1>
        <h1 className="text-xl font-bold text-white"> </h1>
      </div>
      {isConfirmationScreen ? (
        renderConfirmationScreen()
      ) : (
        <form
          className="flex flex-col p-8 pt-6 gap-4 group"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div className="flex gap-4 w-full">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Nombre*
              </label>
              <input
                type="text"
                placeholder="Introducir nombre"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  });
                }}
                value={formData.nombre}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                required
                pattern="^.{2,}$"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 2 caracteres
              </span>
            </div>
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Apellido*
              </label>
              <input
                type="text"
                placeholder="Introducir apellido"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    apellido: e.target.value,
                  });
                }}
                value={formData.apellido}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                pattern="^.{2,}$"
                required
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 2 caracteres
              </span>
            </div>
          </div>
          <div>
            <label className="block text-gray-600 text-base font-medium mb-2">
              Documento*
            </label>
            <div className="flex gap-1">
              <div className="relative w-[20%]">
                <Select
                  options={[
                    {
                      value: "V",
                      label: "V",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "J",
                      label: "J",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "G",
                      label: "G",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "E",
                      label: "E",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "P",
                      label: "P",
                      onClick: (value, label) => {
                        setDocumentType({
                          value,
                          label,
                        });
                      },
                    },
                  ]}
                  selected={documentType}
                  small={true}
                />
              </div>
              <div className="w-[80%]">
                <input
                  type="text"
                  placeholder="Introducir documento"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      documento: e.target.value,
                    });
                  }}
                  value={formData.documento}
                  required
                  className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                  pattern={getDocumentoPatternAndMessage().pattern.source}
                />
                <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                  {getDocumentoPatternAndMessage().message}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Nombre de usuario*
              </label>
              <input
                type="text"
                placeholder="Introducir nombre de usuario"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    nombreUsuario: e.target.value.toLowerCase(),
                  });
                  setStillWriting(true);
                }}
                value={formData.nombreUsuario}
                className={clsx({
                  ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                    !isTaken,
                  ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                    isTaken,
                })}
                required
                minLength={3}
              />
              <span
                className={clsx({
                  ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                    !isTaken,
                  ["mt-2 text-sm text-red-500 block"]: isTaken,
                })}
              >
                {isTaken
                  ? "El nombre de usuario ya existe"
                  : "Minimo 3 caracteres"}
              </span>
            </div>
            <div className="relative w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Rol*
              </label>
              <select
                className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                value={selectedRole.value}
                disabled={true}
              >
                <option value={selectedRole.value}>{selectedRole.label}</option>
              </select>
              <Down className="absolute h-4 w-4 top-11 right-5 fill-slate-300" />
            </div>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              E-mail*
            </label>
            <input
              type="email"
              name="email"
              placeholder="Introducir e-mail"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  correo: e.target.value,
                });
              }}
              value={formData.correo}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              required
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              E-mail invalido
            </span>
          </div>
          <div className="relative w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Contraseña*
            </label>
            <input
              type={visible ? "text" : "password"}
              placeholder="Introducir nueva contraseña"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contraseña: e.target.value,
                })
              }
              value={formData.contraseña}
              className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              name="password"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              autoComplete="new-password"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              La contraseña debe tener mínimo 8 caracteres, contener una letra
              mayúscula, una letra minúscula, un número y un carácter especial
            </span>
            {visible ? (
              <On
                onClick={() => setVisible(false)}
                className="absolute top-10 right-4 fill-[#2096ed]"
              />
            ) : (
              <Off
                onClick={() => setVisible(true)}
                className="absolute top-10 right-4 fill-[#2096ed]"
              />
            )}
          </div>
          <div className="flex gap-2 justify-self-end justify-end">
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
                  !isTaken,
                ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                  isTaken ||
                  stillWriting ||
                  formData?.nombre.length < 2 ||
                  formData?.nombreUsuario.length < 3,
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
  usuario,
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Eliminar usuario</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando usuario...");
          void UserService.delete(usuario?.id!).then((data) => {
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
            Completar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function ViewModal({ isOpen, closeModal, usuario }: ModalProps) {
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Datos del usuario</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Columna 1 */}
            <div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.nombre || "No especificado"}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Nombre de usuario
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.nombreUsuario || "No especificado"}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Documento
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.documento}
                </p>
              </div>
            </div>

            {/* Columna 2 */}
            <div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Apellido
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.apellido || "No especificado"}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Rol
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.rol?.nombre || "No especificado"}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  E-mail
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {usuario?.correo || "No especificado"}
                </p>
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

function DataRow({ usuario, setOperationAsCompleted }: DataRowProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.usuario
      ? "EDIT"
      : permissions.find()?.eliminar.usuario
      ? "DELETE"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const navigate = useNavigate();

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
        className="px-6 py-3 font-bold whitespace-nowrap text-[#2096ed] border border-slate-300 w-[50px]"
      >
        {usuario?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300 truncate min-w-[180px]">
        {usuario?.nombre} {usuario?.apellido}
      </td>
      <td className="px-6 py-2 border border-slate-300 truncate">
        <div className="bg-gray-200 text-center text-gray-600 text-xs py-2 font-bold rounded-lg">
          {usuario?.nombreUsuario}{" "}
          {session.find()?.usuario?.id === usuario?.id ? "(Tu usuario)" : null}
        </div>
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {usuario?.documento}
      </td>
      <td className="px-6 py-4 border border-slate-300">{usuario?.correo}</td>
      <td className="px-6 py-2 border border-slate-300">
        <div className="bg-blue-200 text-center text-blue-600 text-xs py-2 font-bold rounded-lg">
          {usuario?.rol?.nombre}
        </div>
      </td>
      <td ref={ref} className="px-6 py-3 border border-slate-300 min-w-[210px] w-[210px] relative">
        {action === "EDIT" && (
          <>
            {
              //@ts-ignore
              usuario?.creado_por?.lista?.find(
                (id) => session.find()?.usuario.id === id
              ) || session.find()?.usuario.id === usuario?.id ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditOpen(true);
                    }}
                    className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
                  >
                    {session.find()?.usuario.id === usuario?.id
                      ? "Editar usuario"
                      : "Editar usuario"}
                  </button>
                  <EditModal
                    usuario={usuario}
                    isOpen={isEditOpen}
                    closeModal={closeEditModal}
                    setOperationAsCompleted={setOperationAsCompleted}
                  />
                </>
              ) : (
                <button className="font-medium text-[#2096ed] dark:text-blue-500 line-through cursor-default">
                  Editar usuario
                </button>
              )
            }
          </>
        )}
        {action === "PREVIEW" && (
          <>
            <button
              onClick={() => {
                navigate(`/usuarios/${usuario?.id}/actividad`);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Mostrar actividad
            </button>
          </>
        )}
        {action === "DELETE" && (
          <>
            {
              //@ts-ignore
              usuario?.creado_por?.lista?.find(
                (id) => session.find()?.usuario.id === id
              ) || session.find()?.usuario.id === usuario?.id ? (
                <>
                  <button
                    onClick={() => {
                      setIsDeleteOpen(true);
                    }}
                    className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
                  >
                    {session.find()?.usuario.id === usuario?.id
                      ? "Eliminar usuario"
                      : "Eliminar usuario"}
                  </button>
                  <DeleteModal
                    usuario={usuario}
                    isOpen={isDeleteOpen}
                    closeModal={closeDeleteModal}
                    setOperationAsCompleted={setOperationAsCompleted}
                  />
                </>
              ) : (
                <button className="font-medium text-[#2096ed] dark:text-blue-500 line-through cursor-default">
                  Eliminar usuario
                </button>
              )
            }
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
              Mostrar usuario
            </button>
            <ViewModal
              usuario={usuario}
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
            id={usuario?.id}
            top={
              (ref?.current?.getBoundingClientRect().top ?? 0) +
              (window.scrollY ?? 0) +
              (ref?.current?.getBoundingClientRect().height ?? 0) -
              10
            }
            left={
              (ref?.current?.getBoundingClientRect().left ?? 0) + window.scrollX + 25
            }
          />
        )}
        <button
          id={`acciones-btn-${usuario?.id}`}
          className="bg-gray-300 border right-6 bottom-2.5 absolute hover:bg-gray-400 outline-none text-black text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
          onClick={() => setIsDropup(!isDropup)}
        >
          <More className="w-5 h-5 inline fill-black" />
        </button>
      </td>
    </tr>
  );
}

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const setIsPrecise = useUserSearchParamStore((state) => state.setIsPrecise);
  const setTempIsPrecise = useUserSearchParamStore(
    (state) => state.setTempIsPrecise
  );
  const tempIsPrecise = useUserSearchParamStore((state) => state.tempIsPrecise);
  const tempInput = useUserSearchParamStore((state) => state.tempInput);
  const setInput = useUserSearchParamStore((state) => state.setInput);
  const setTempInput = useUserSearchParamStore((state) => state.setTempInput);
  const setParam = useUserSearchParamStore((state) => state.setParam);
  const incrementSearchCount = useUserSearchParamStore(
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
      className="w-full max-w-[90%] md:w-3/5 lg:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Buscar usuario</h1>
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
              {
                value: "APELLIDO",
                label: "Apellido",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "NOMBRE_USUARIO",
                label: "Nombre de usuario",
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
            selectedSearchType.value === "NOMBRE"
              ? "Introduzca nombre del usuario"
              : selectedSearchType.value === "APELLIDO"
              ? "Introduzca apellido del usuario"
              : selectedSearchType.value === "NOMBRE_USUARIO"
              ? "Introduzca nombre de usuario del usuario"
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
        <div className="flex w-full justify-between items-center">
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
          <div className="flex gap-2">
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
      {permissions.find()?.editar.usuario && (
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
            Editar usuario
          </div>
        </li>
      )}
      {permissions.find()?.eliminar.usuario && (
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
            Eliminar usuario
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
          Mostrar usuario
        </div>
      </li>
      <li>
        <div
          onClick={() => {
            selectAction("PREVIEW");
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
          Mostrar actividad
        </div>
      </li>
    </ul>
  );
}

function Dropup({ close, selectAction }: DropupProps) {
  const dropupRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropupRef.current &&
        !dropupRef.current.contains(event.target) &&
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
      ref={dropupRef}
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
      {permissions.find()?.crear.usuario && (
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
            Añadir usuario
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
          Buscar usuario
        </div>
      </li>
    </ul>
  );
}

export default function UsersDataDisplay() {
  const [currentUser, setCurrentUser] = useState<Usuario | undefined>();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [action, setAction] = useState<`${Action}`>("ADD");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useUserSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useUserSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useUserSearchParamStore((state) => state.input);
  const param = useUserSearchParamStore((state) => state.param);
  const isPrecise = useUserSearchParamStore((state) => state.isPrecise);
    const setIsPrecise = useUserSearchParamStore(
      (state) => state.setIsPrecise
    );
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const size = 7;

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
      void UserService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          setUsers([]);
          setWasSearch(false);
          resetSearchCount();
        } else {
          if (!currentUser) {
            void UserService.getById(session.find()?.usuario.id!).then(
              (user) => {
                if (user) {
                  setCurrentUser(user);
                  const withOutUser = data.rows.filter(
                    (obj) => obj.id !== user.id
                  );
                  withOutUser.unshift(user), setUsers(withOutUser);
                  setPages(data.pages);
                  setCurrent(data.current);
                  setLoading(false);
                  setNotFound(false);
                  setWasSearch(false);
                  resetSearchCount();
                }
              }
            );
          } else {
            const withOutUser = data.rows.filter(
              (obj) => obj.id !== currentUser.id
            );
            withOutUser.unshift(currentUser), setUsers(withOutUser);
            setPages(data.pages);
            setCurrent(data.current);
            setLoading(false);
            setNotFound(false);
            setWasSearch(false);
            resetSearchCount();
          }
        }
        setIsOperationCompleted(false);
      });
    } else {
      if (isPrecise && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        if (param === "NOMBRE") {
          void UserService.getByExactNombre(input, page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setUsers([]);
            } else {
              setUsers(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsPrecise(false)
            setIsOperationCompleted(false);
          });
        } else if (param === "APELLIDO") {
          void UserService.getByExactApellido(input, page, size).then(
            (data) => {
              if (data === false) {
                setNotFound(true);
                setLoading(false);
                setUsers([]);
              } else {
                setUsers(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              toast.dismiss(loadingToast);
              setIsPrecise(false)
              setIsOperationCompleted(false);
            }
          );
        } else if (param === "NOMBRE_USUARIO") {
          void UserService.getByExactNombreUsuario(input, page, size).then(
            (data) => {
              if (data === false) {
                setNotFound(true);
                setLoading(false);
                setUsers([]);
              } else {
                setUsers(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              toast.dismiss(loadingToast);
              setIsPrecise(false)
              setIsOperationCompleted(false);
            }
          );
        }
      } else if (!isPrecise && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        if (param === "NOMBRE") {
          void UserService.getByNombre(input, page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setUsers([]);
            } else {
              setUsers(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "APELLIDO") {
          void UserService.getByApellido(input, page, size).then((data) => {
            if (data === false) {
              setNotFound(true);
              setLoading(false);
              setUsers([]);
            } else {
              setUsers(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            toast.dismiss(loadingToast);
            setIsOperationCompleted(false);
          });
        } else if (param === "NOMBRE_USUARIO") {
          void UserService.getByNombreUsuario(input, page, size).then(
            (data) => {
              if (data === false) {
                setNotFound(true);
                setLoading(false);
                setUsers([]);
              } else {
                setUsers(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              toast.dismiss(loadingToast);
              setIsOperationCompleted(false);
            }
          );
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
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span
              onClick={resetSearchCount}
              className="text-[#2096ed] cursor-pointer"
            >
              Usuarios
            </span>
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
                Añadir usuario
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
                  Buscar usuario
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
        {users.length > 0 && loading == false && (
          <div className="relative overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Nombre completo
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Nombre de usuario
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Documento
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Correo
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  return (
                    <DataRow
                      action={""}
                      usuario={user}
                      setOperationAsCompleted={setAsCompleted}
                      key={user.id}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true || (users.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún usuario encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningún usuario registrado."
                  : "Esto puede deberse a un error del servidor, o a que ningún usuario concuerda con tu busqueda"}
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
      {users.length > 0 && loading == false && (
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
        setOperationAsCompleted={setAsCompleted}
        closeModal={closeAddModal}
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
