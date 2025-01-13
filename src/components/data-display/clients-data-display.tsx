import { useCallback, useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import { ReactComponent as Warning } from "/src/assets/circle-exclamation-solid.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Cliente,
  Selected,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import ClientService from "../../services/client-service";
import Select from "../misc/select";
import permissions from "../../utils/permissions";
import { useClientSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import { ReactComponent as On } from "/src/assets/visibility.svg";
import { ReactComponent as Off } from "/src/assets/visibility_off.svg";
import clsx from "clsx";
import { createRowNumber } from "../../utils/functions";
import debounce from "lodash.debounce";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [documentType, setDocumentType] = useState<Selected>({
    value: "V",
    label: "V",
  });
  const [formData, setFormData] = useState<Cliente>({
    nombre: "",
    apellido: "",
    documento: "",
    email: "",
    telefono: "",
    dirección: "",
    enviarMensajes: false,
    contraseña: "",
  });
  const [visible, setVisible] = useState(false);
  const [documentoExist, setDocumentoExist] = useState(false);
  const [stillWritingDocumento, setStillWritingDocumento] = useState(false);
  const [correoExist, setCorreoExist] = useState(false);
  const [stillWritingCorreo, setStillWritingCorreo] = useState(false);

  const resetFormData = () => {
    setFormData({
      nombre: "",
      apellido: "",
      documento: "",
      email: "",
      telefono: "",
      dirección: "",
      enviarMensajes: false,
      contraseña: "",
    });
    setDocumentType({
      value: "V",
      label: "V",
    });
    setVisible(false);
    setIsConfirmationScreen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const updatedFormData = { ...formData };

    // Formatear el documento según el tipo seleccionado
    if (formData.documento) {
      updatedFormData.documento = `${documentType.value}-${formData.documento}`;
    }

    const loadingToast = toast.loading("Añadiendo cliente...");
    void ClientService.create(updatedFormData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data.status === "error") {
        toast.error(data.message);
      } else {
        toast.success(data.message);
      }
    });
  };

  const checkDocumento = useCallback(
    debounce(async (documento) => {
      if (documento.length >= 8) {
        const exist = await ClientService.getByExactDocumento(
          documento,
          1,
          100
        );
        if (exist) {
          setDocumentoExist(true);
          setStillWritingDocumento(false);
        } else {
          setDocumentoExist(false);
          setStillWritingDocumento(false);
        }
      }
    }, 500),
    []
  );

  const checkCorreo = useCallback(
    debounce(async (correo) => {
      const exist = await ClientService.getByExactEmail(correo, 1, 100);
      if (exist) {
        setCorreoExist(true);
        setStillWritingCorreo(false);
      } else {
        setCorreoExist(false);
        setStillWritingCorreo(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkDocumento(`${documentType.value}-${formData.documento}`);
  }, [formData.documento, documentType.value]);

  useEffect(() => {
    checkCorreo(formData.email);
  }, [formData.email]);

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
      <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Nombre
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.nombre}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Apellido
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.apellido || "No especificado"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Documento
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {documentType.value}-{formData.documento}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Teléfono
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.telefono || "No especificado"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Email
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.email || "No especificado"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Dirección
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              {formData.dirección || "No especificada"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
              Envio de mensajes
            </p>
            <p className="text-gray-900 font-medium text-base break-words">
              <span
                className={
                  formData.enviarMensajes ? "text-green-600" : "text-red-600"
                }
              >
                {formData.enviarMensajes ? "Activado" : "Desactivado"}
              </span>
            </p>
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

  return (
    <dialog
      ref={ref}
      className="w-full max-w-[90%] md:w-3/5 lg:w-3/6 xl:w-2/5 h-fit rounded shadow max-h-[650px] overflow-y-auto scrollbar-thin text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen ? "Confirmar cliente" : "Añadir cliente"}
        </h1>
      </div>
      {isConfirmationScreen ? (
        renderConfirmationScreen()
      ) : (
        <form
          className="flex flex-col p-8 pt-6 gap-4 select-none group"
          autoComplete="none"
          noValidate={true}
          onSubmit={handleSubmit}
        >
          <div className="flex gap-2">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2 -mt-1">
                Nombre<span className="text-red-600 text-lg">*</span>
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
                pattern={
                  formData.apellido.length > 0 ? "^.{1,50}$" : "^.{1,150}$"
                }
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                {formData.apellido.length > 0
                  ? "Minimo 1 carácter, máximo 50"
                  : "Minimo 1 carácter, máximo 150"}
              </span>
            </div>
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Apellido
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
                pattern="^.{1,50}$"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 1 carácter, máximo 50
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2 -mt-1">
                Documento<span className="text-red-600 text-lg">*</span>
              </label>
              <div className="flex w-full gap-1">
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
                      setStillWritingDocumento(true);
                    }}
                    value={formData.documento}
                    required
                    className={clsx({
                      ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                        !documentoExist,
                      ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                        documentoExist,
                    })}
                    pattern={getDocumentoPatternAndMessage().pattern.source}
                  />
                  <span
                    className={clsx({
                      ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                        !documentoExist,
                      ["mt-2 text-sm text-red-500 block"]: documentoExist,
                    })}
                  >
                    {documentoExist
                      ? "Documento ya registrado"
                      : getDocumentoPatternAndMessage().message}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="Introducir teléfono"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    telefono: e.target.value,
                  });
                }}
                value={formData.telefono}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                pattern="^\+(?:[0-9]●?){11,12}[0-9]$"
                required={formData.enviarMensajes}
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Teléfono debe estar en formato E.164
              </span>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              placeholder="Introducir e-mail"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  email: e.target.value,
                });
                setStillWritingCorreo(true);
              }}
              value={formData.email}
              className={clsx({
                ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                  !correoExist,
                ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                  correoExist,
              })}
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              maxLength={254}
            />
            <span
              className={clsx({
                ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                  !correoExist,
                ["mt-2 text-sm text-red-500 block"]: correoExist,
              })}
            >
              {correoExist ? "E-mail ya registrado" : "E-mail invalido"}
            </span>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Dirección<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              placeholder="Introducir dirección"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  dirección: e.target.value,
                });
              }}
              value={formData.dirección}
              autoComplete="none"
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^.{1,150}$"
              required
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 150
            </span>
          </div>
          <div className="relative w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Contraseña
            </label>
            <input
              type={visible ? "text" : "password"}
              placeholder="Introducir contraseña"
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
              maxLength={32}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              La contraseña debe tener mínimo 8 caracteres y máximo 32, contener
              una letra mayúscula, una letra minúscula, un número y un carácter
              especial
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
          <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
              <input
                className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    enviarMensajes: e.target.checked,
                  });
                }}
                checked={formData.enviarMensajes}
                id="checkbox"
              />
              <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
                htmlFor="checkbox"
              >
                ¿Enviar mensajes?
              </label>
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
                    !documentoExist || !correoExist,
                  ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                    documentoExist ||
                    stillWritingDocumento ||
                    correoExist ||
                    stillWritingCorreo,
                })}
              >
                Completar
              </button>
            </div>
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
  cliente,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const initialDocumentType = cliente?.documento
    ? cliente.documento.split("-")[0]
    : "V";
  const [documentType, setDocumentType] = useState<Selected>({
    value: initialDocumentType,
    label: initialDocumentType,
  });
  const initialDocumento = cliente?.documento
    ? cliente.documento.split("-").slice(1).join("-")
    : "";
  const [formData, setFormData] = useState<Cliente>({
    ...cliente!,
    contraseña: "",
    documento: initialDocumento,
  });
  const [visible, setVisible] = useState(false);
  const [documentoExist, setDocumentoExist] = useState(false);
  const [stillWritingDocumento, setStillWritingDocumento] = useState(false);
  const [correoExist, setCorreoExist] = useState(false);
  const [stillWritingCorreo, setStillWritingCorreo] = useState(false);

  const resetFormData = () => {
    setFormData({
      ...cliente!,
      contraseña: "",
      documento: cliente?.documento
        ? cliente.documento.split("-").slice(1).join("-") // Extraer el documento sin el prefijo
        : "",
    });
    setDocumentType({
      value: cliente?.documento?.charAt(0) || "V",
      label: cliente?.documento?.charAt(0) || "V",
    });
    setVisible(false);
    setIsConfirmationScreen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const updatedFormData = { ...formData };

    // Formatear el documento según el tipo seleccionado
    if (formData.documento) {
      updatedFormData.documento = `${documentType.value}-${formData.documento}`;
    }

    const loadingToast = toast.loading("Editando cliente...");
    void ClientService.update(cliente?.id!, updatedFormData).then((data) => {
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

  const checkDocumento = useCallback(
    debounce(async (documento) => {
      if (documento.length >= 8) {
        const exist = await ClientService.getByExactDocumento(
          documento,
          1,
          100
        );
        if (exist && cliente?.documento !== documento) {
          setDocumentoExist(true);
          setStillWritingDocumento(false);
        } else {
          setDocumentoExist(false);
          setStillWritingDocumento(false);
        }
      }
    }, 500),
    []
  );

  const checkCorreo = useCallback(
    debounce(async (correo) => {
      const exist = await ClientService.getByExactEmail(correo, 1, 100);
      if (exist && cliente?.email !== correo) {
        setCorreoExist(true);
        setStillWritingCorreo(false);
      } else {
        setCorreoExist(false);
        setStillWritingCorreo(false);
      }
    }, 500),
    []
  );

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
    checkDocumento(`${documentType.value}-${formData.documento}`);
  }, [formData.documento, documentType.value]);

  useEffect(() => {
    checkCorreo(formData.email);
  }, [formData.email]);

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
                  {cliente?.nombre}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Apellido
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {cliente?.apellido || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Documento
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {cliente?.documento}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Teléfono
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {cliente?.telefono || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Email
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {cliente?.email || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Dirección
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {cliente?.dirección || "No especificada"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Envío de mensajes
                </p>
                <p className="text-gray-900 font-medium text-base break-words">
                  {cliente?.enviarMensajes ? "Activado" : "Desactivado"}
                </p>
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
                    formData.nombre !== cliente?.nombre
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.nombre}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Apellido
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.apellido !== cliente?.apellido
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.apellido || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Documento
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    `${documentType.value}-${formData.documento}` !==
                    cliente?.documento
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {documentType.value}-{formData.documento}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Teléfono
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.telefono !== cliente?.telefono
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.telefono || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Email
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.email !== cliente?.email
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.email || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Dirección
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.dirección !== cliente?.dirección
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.dirección || "No especificada"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                  Envío de mensajes
                </p>
                <p
                  className={`text-base font-medium break-words ${
                    formData.enviarMensajes !== cliente?.enviarMensajes
                      ? "text-blue-600 font-semibold"
                      : "text-gray-900"
                  }`}
                >
                  {formData.enviarMensajes ? "Activado" : "Desactivado"}
                </p>
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
        <h1 className="text-xl font-bold text-white">
          {isConfirmationScreen ? "Confirmar cambios" : "Editar cliente"}
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
          <div className="flex gap-2">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2 -mt-1">
                Nombre<span className="text-red-600 text-lg">*</span>
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
                pattern={
                  formData.apellido.length > 0 ? "^.{1,50}$" : "^.{1,150}$"
                }
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                {formData.apellido.length > 0
                  ? "Minimo 1 carácter, máximo 50"
                  : "Minimo 1 carácter, máximo 150"}
              </span>
            </div>
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Apellido
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
                pattern="^.{1,50}$"
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Minimo 1 carácter, máximo 50
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2 -mt-1">
                Documento<span className="text-red-600 text-lg">*</span>
              </label>
              <div className="flex w-full gap-1">
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
                      setStillWritingDocumento(true);
                    }}
                    value={formData.documento}
                    required
                    className={clsx({
                      ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                        !documentoExist,
                      ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                        documentoExist,
                    })}
                    pattern={getDocumentoPatternAndMessage().pattern.source}
                  />
                  <span
                    className={clsx({
                      ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                        !documentoExist,
                      ["mt-2 text-sm text-red-500 block"]: documentoExist,
                    })}
                  >
                    {documentoExist
                      ? "Documento ya registrado"
                      : getDocumentoPatternAndMessage().message}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-2/4">
              <label className="block text-gray-600 text-base font-medium mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="Introducir teléfono"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    telefono: e.target.value,
                  });
                }}
                value={formData.telefono}
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                pattern="^\+(?:[0-9]●?){10,12}[0-9]$"
                required={formData.enviarMensajes}
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                Teléfono debe estar en formato E.164
              </span>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              placeholder="Introducir e-mail"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  email: e.target.value,
                });
                setStillWritingCorreo(true);
              }}
              value={formData.email}
              className={clsx({
                ["border p-2 rounded outline-none focus:border-[#2096ed] border-slate-300 w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"]:
                  !correoExist,
                ["border p-2 rounded outline-none focus:border-red-500 border-red-600 text-red-500 w-full"]:
                  correoExist,
              })}
              pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              maxLength={254}
            />
            <span
              className={clsx({
                ["mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block"]:
                  !correoExist,
                ["mt-2 text-sm text-red-500 block"]: correoExist,
              })}
            >
              {correoExist ? "E-mail ya registrado" : "E-mail invalido"}
            </span>
          </div>
          <div className="w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Dirección<span className="text-red-600 text-lg">*</span>
            </label>
            <input
              type="text"
              placeholder="Introducir dirección"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  dirección: e.target.value,
                });
              }}
              value={formData.dirección}
              autoComplete="none"
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^.{1,150}$"
              required
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 1 carácter, máximo 150
            </span>
          </div>
          <div className="relative w-full">
            <label className="block text-gray-600 text-base font-medium mb-2">
              Contraseña
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
              maxLength={32}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              La contraseña debe tener mínimo 8 caracteres y máximo 32, contener
              una letra mayúscula, una letra minúscula, un número y un carácter
              especial.
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
          <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
              <input
                className="mr-1 leading-tight w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                type="checkbox"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    enviarMensajes: e.target.checked,
                  });
                }}
                checked={formData.enviarMensajes}
                id="checkbox"
              />
              <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
                htmlFor="checkbox"
              >
                ¿Enviar mensajes?
              </label>
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
                    !documentoExist || !correoExist,
                  ["pointer-events-none opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"]:
                    documentoExist ||
                    stillWritingDocumento ||
                    correoExist ||
                    stillWritingCorreo,
                })}
              >
                Completar
              </button>
            </div>
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
  cliente,
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
        <h1 className="text-xl font-bold text-white">Eliminar cliente</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando cliente...");
          ClientService.delete(cliente?.id!).then((data) => {
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

function ViewModal({ isOpen, closeModal, cliente }: ModalProps) {
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
        <h1 className="text-xl font-bold text-white">Datos del cliente</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border-gray-300 p-6 border rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Nombre
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {cliente?.nombre}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Apellido
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {cliente?.apellido || "No especificado"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Documento
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {cliente?.documento}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Teléfono
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {cliente?.telefono || "No especificado"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Email
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {cliente?.email || "No especificado"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Dirección
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                {cliente?.dirección || "No especificada"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Envio de mensajes
              </p>
              <p className="text-gray-900 font-medium text-base break-words">
                <span
                  className={
                    cliente?.enviarMensajes ? "text-green-600" : "text-red-600"
                  }
                >
                  {cliente?.enviarMensajes ? "Activado" : "Desactivado"}
                </span>
              </p>
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

function SearchModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedSearchType, setSelectedSearchType] = useState<Selected>({
    value: "",
    label: "Seleccionar parametro de busqueda",
  });
  const setIsPrecise = useClientSearchParamStore((state) => state.setIsPrecise);
  const setTempIsPrecise = useClientSearchParamStore(
    (state) => state.setTempIsPrecise
  );
  const tempIsPrecise = useClientSearchParamStore(
    (state) => state.tempIsPrecise
  );
  const tempInput = useClientSearchParamStore((state) => state.tempInput);
  const setInput = useClientSearchParamStore((state) => state.setInput);
  const setTempInput = useClientSearchParamStore((state) => state.setTempInput);
  const setParam = useClientSearchParamStore((state) => state.setParam);
  const incrementSearchCount = useClientSearchParamStore(
    (state) => state.incrementSearchCount
  );
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useClientSearchParamStore(
    (state) => state.setJustSearched
  );

  const resetSearch = () => {
    setTempInput("");
    setTempIsPrecise(false);
    setSelectedSearchType({
      value: "",
      label: "Seleccionar parametro de busqueda",
    });
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
        <h1 className="text-xl font-bold text-white">Buscar cliente</h1>
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
            setJustSearched(true);
          }
        }}
      >
        <div className="relative">
          <Select
            onChange={() => {
              if (isOpen) {
                setParam(selectedSearchType.value as string);
              }
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
                value: "DOCUMENTO",
                label: "Documento",
                onClick: (value, label) => {
                  setSelectedSearchType({
                    value,
                    label,
                  });
                },
              },
              {
                value: "TELEFONO",
                label: "Telefono",
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
              ? "Introduzca nombre del cliente"
              : selectedSearchType.value === "APELLIDO"
              ? "Introduzca apellido del cliente"
              : selectedSearchType.value === "TELEFONO"
              ? "Introduzca telefono del cliente"
              : selectedSearchType.value === "DOCUMENTO"
              ? "Introduzca documento del cliente"
              : ""
          }
          value={tempInput}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
          onChange={(e) => {
            if (isOpen) {
              setInput(e.target.value);
            }
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
                if (isOpen) {
                  setIsPrecise(e.target.checked);
                }
                setTempIsPrecise(e.target.checked);
              }}
              checked={
                selectedSearchType.value === "TELEFONO" ? false : tempIsPrecise
              }
              disabled={selectedSearchType.value === "TELEFONO"}
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

function DataRow({
  cliente,
  setOperationAsCompleted,
  row_number,
}: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.cliente
      ? "EDIT"
      : permissions.find()?.eliminar.cliente
      ? "DELETE"
      : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    permissions.find()?.editar.cliente || permissions.find()?.eliminar.cliente;

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
      <td className="px-6 py-4 border border-slate-300 truncate min-w-[180px]">
        {cliente?.nombre} {cliente?.apellido || ""}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {cliente?.documento || "No especificado"}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[150px]">
        {cliente?.email || "No especificado"}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        {cliente?.telefono || "No especificado"}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        {cliente?.dirección || "No especificada"}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 min-w-[200px] w-[200px] relative"
      >
        {action === "EDIT" && (
          <>
            <button
              onClick={() => {
                setIsEditOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar cliente
            </button>
            <EditModal
              cliente={cliente}
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
              Eliminar cliente
            </button>
            <DeleteModal
              cliente={cliente}
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
              Mostrar cliente
            </button>
            <ViewModal
              cliente={cliente}
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
            id={cliente?.id}
            top={
              (ref?.current?.getBoundingClientRect().top ?? 0) +
              (window.scrollY ?? 0) +
              (ref?.current?.getBoundingClientRect().height ?? 0) -
              10
            }
            left={
              (ref?.current?.getBoundingClientRect().left ?? 0) +
              window.scrollX +
              32
            }
          />
        )}
        {anyAction ? (
          <button
            id={`acciones-btn-${cliente?.id}`}
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
      {permissions.find()?.crear.cliente && (
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
            Añadir cliente
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
          Buscar cliente
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
      {permissions.find()?.editar.cliente && (
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
            Editar cliente
          </div>
        </li>
      )}
      {permissions.find()?.eliminar.cliente && (
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
            Eliminar cliente
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
          Mostrar cliente
        </div>
      </li>
    </ul>
  );
}

export default function ClientsDataDisplay() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.crear.cliente ? "ADD" : "SEARCH"
  );
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const searchCount = useClientSearchParamStore((state) => state.searchCount);
  const resetSearchCount = useClientSearchParamStore(
    (state) => state.resetSearchCount
  );
  const input = useClientSearchParamStore((state) => state.input);
  const param = useClientSearchParamStore((state) => state.param);
  const setIsPrecise = useClientSearchParamStore((state) => state.setIsPrecise);
  const isPrecise = useClientSearchParamStore((state) => state.isPrecise);
  const [isSearch, setIsSearch] = useState(false);
  const wasSearch = useSearchedStore((state) => state.wasSearch);
  const setWasSearch = useSearchedStore((state) => state.setWasSearch);
  const setJustSearched = useClientSearchParamStore(
    (state) => state.setJustSearched
  );
  const justSearched = useClientSearchParamStore((state) => state.justSearched);
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
      void ClientService.getAll(page, size).then((data) => {
        if (data === false) {
          setNotFound(true);
          setClientes([]);
          setLoading(false);
          resetSearchCount();
          setWasSearch(false);
        } else {
          setClientes(data.rows);
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
      if (isPrecise && wasSearch) {
        let loadingToast = undefined;

        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }

        if (param === "NOMBRE") {
          void ClientService.getByExactNombre(input, page, size).then(
            (data) => {
              toast.dismiss(loadingToast);
              if (data === false) {
                setNotFound(true);
                setClientes([]);
                setLoading(false);
              } else {
                setClientes(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              setIsOperationCompleted(false);
            }
          );
        } else if (param === "APELLIDO") {
          void ClientService.getByExactApellido(input, page, size).then(
            (data) => {
              toast.dismiss(loadingToast);
              if (data === false) {
                setNotFound(true);
                setClientes([]);
                setLoading(false);
              } else {
                setClientes(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              setIsOperationCompleted(false);
            }
          );
        } else if (param === "TELEFONO") {
          let sanitizedTelefono = input;

          if ((input as string).startsWith("+")) {
            sanitizedTelefono = (input as string).substring(1); // Quita el primer carácter (el '+')
          }

          void ClientService.getByExactTelefono(
            sanitizedTelefono,
            page,
            size
          ).then((data) => {
            toast.dismiss(loadingToast);
            if (data === false) {
              setNotFound(true);
              setClientes([]);
              setLoading(false);
            } else {
              setClientes(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            setIsOperationCompleted(false);
          });
        } else if (param === "DOCUMENTO") {
          void ClientService.getByExactDocumento(input, page, size).then(
            (data) => {
              toast.dismiss(loadingToast);
              if (data === false) {
                setNotFound(true);
                setClientes([]);
                setLoading(false);
              } else {
                setClientes(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              setIsOperationCompleted(false);
            }
          );
        }
      } else if (!isPrecise && wasSearch) {
        let loadingToast = undefined;

        if (justSearched) {
          loadingToast = toast.loading("Buscando...");
        }

        if (param === "NOMBRE") {
          void ClientService.getByNombre(input, page, size).then((data) => {
            toast.dismiss(loadingToast);
            if (data === false) {
              setNotFound(true);
              setClientes([]);
              setLoading(false);
            } else {
              setClientes(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            setIsOperationCompleted(false);
          });
        } else if (param === "APELLIDO") {
          void ClientService.getByApellido(input, page, size).then((data) => {
            toast.dismiss(loadingToast);
            if (data === false) {
              setNotFound(true);
              setClientes([]);
              setLoading(false);
            } else {
              setClientes(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
            setIsOperationCompleted(false);
          });
        } else if (param === "TELEFONO") {
          let sanitizedTelefono = input;

          if ((input as string).startsWith("+")) {
            sanitizedTelefono = (input as string).substring(1); // Quita el primer carácter (el '+')
          }

          void ClientService.getByTelefono(sanitizedTelefono, page, size).then(
            (data) => {
              toast.dismiss(loadingToast);
              if (data === false) {
                setNotFound(true);
                setClientes([]);
                setLoading(false);
              } else {
                setClientes(data.rows);
                setPages(data.pages);
                setCurrent(data.current);
                setLoading(false);
                setNotFound(false);
              }
              setIsOperationCompleted(false);
            }
          );
        } else if (param === "DOCUMENTO") {
          void ClientService.getByDocumento(input, page, size).then((data) => {
            toast.dismiss(loadingToast);
            if (data === false) {
              setNotFound(true);
              setClientes([]);
              setLoading(false);
            } else {
              setClientes(data.rows);
              setPages(data.pages);
              setCurrent(data.current);
              setLoading(false);
              setNotFound(false);
            }
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
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed] cursor-pointer">Clientes</span>
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
              <>
                {searchCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      resetSearchCount();
                      setIsPrecise(false);
                    }}
                    className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                  >
                    Cancelar busqueda
                  </button>
                ) : null}
                <button
                  onClick={openAddModal}
                  className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                >
                  Añadir cliente
                </button>
              </>
            ) : null}
            {action === "SEARCH" ? (
              <>
                {searchCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      resetSearchCount();
                      setIsPrecise(false);
                    }}
                    className="text-gray-500 bg-gray-200 text-sm font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
                  >
                    Cancelar busqueda
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSearch(true)}
                    className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                  >
                    Buscar cliente
                  </button>
                )}
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
        {clientes.length > 0 && loading == false && (
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
                    Documento
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Teléfono
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Dirección
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, index) => {
                  return (
                    <DataRow
                      action={""}
                      cliente={cliente}
                      setOperationAsCompleted={setAsCompleted}
                      key={cliente.id}
                      row_number={createRowNumber(current, size, index + 1)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {(notFound === true ||
          (clientes.length === 0 && loading === false)) && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún cliente encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                {searchCount === 0
                  ? "Esto puede deberse a un error del servidor, o a que no hay ningún cliente registrado."
                  : "Esto puede deberse a un error del servidor, o a que ningún cliente concuerda con tu busqueda."}
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
      {clientes.length > 0 && loading == false && (
        <Pagination
          pages={pages}
          current={current}
          next={() => {
            if (current < pages && current !== pages) {
              setPage(page + 1);
              setJustSearched(false);
            }
          }}
          prev={() => {
            if (current > 1) {
              setPage(page - 1);
            }
          }}
        />
      )}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            duration: 1000,
          },
          error: {
            duration: 1500
          }
        }}
      />
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
