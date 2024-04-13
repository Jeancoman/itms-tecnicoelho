import { useEffect, useRef, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import Select from "../misc/select";
import session from "../../utils/session";
import permissions from "../../utils/permissions";
import { useClientSearchParamStore } from "../../store/searchParamStore";
import { useSearchedStore } from "../../store/searchedStore";
import { ReactComponent as On } from "/src/assets/visibility.svg";
import { ReactComponent as Off } from "/src/assets/visibility_off.svg";
import clsx from "clsx";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [documentType, setDocumentType] = useState<Selected>({
    value: "RIF",
    label: "RIF",
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
    setVisible(false);
    setDocumentType({
      value: "RIF",
      label: "RIF",
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
      className="w-2/5 h-fit rounded shadow"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Añadir cliente</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 select-none group"
        autoComplete="none"
        noValidate={true}
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          let updatedFormData = { ...formData };
          updatedFormData.documento = formData.documento
            ? documentType.value === "V"
              ? "V-" + formData.documento
              : formData.documento
            : undefined;
          const loadingToast = toast.loading("Añadiendo cliente...");
          ClientService.create(updatedFormData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Cliente no pudo ser añadido.");
            } else {
              toast.success("Cliente añadido con exito.");
            }
          });
        }}
      >
        <div className="flex gap-2">
          <div className="w-2/4">
            <input
              type="text"
              placeholder="Nombre*"
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
            <input
              type="text"
              placeholder="Apellido"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  apellido: e.target.value,
                });
              }}
              value={formData.apellido}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^.{2,}$"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 2 caracteres
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex w-2/4 gap-1">
            <div className="relative w-[28%]">
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
                    value: "RIF",
                    label: "RIF",
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
            <div className="w-[72%]">
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
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                pattern={
                  documentType.value === "RIF"
                    ? "^[A-Za-z]-?\\d{1,9}-?\\d?$"
                    : "^\\d{1,3}\\.\\d{3}\\.\\d{3}$"
                }
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                {documentType.value === "RIF"
                  ? "Formato: J-30684267-5"
                  : "Formato: 29.946.012"}
              </span>
            </div>
          </div>
          <div className="w-2/4">
            <input
              type="tel"
              placeholder="Teléfono"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  telefono: e.target.value,
                });
              }}
              value={formData.telefono}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^\+(?:[0-9]●?){6,14}[0-9]$"
              required={formData.enviarMensajes}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Teléfono debe estar en formato E.164
            </span>
          </div>
        </div>
        <div className="w-full">
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            onChange={(e) => {
              setFormData({
                ...formData,
                email: e.target.value,
              });
            }}
            value={formData.email}
            className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            E-mail invalido
          </span>
        </div>
        <div className="w-full">
          <input
            type="text"
            placeholder="Dirección"
            onChange={(e) => {
              setFormData({
                ...formData,
                dirección: e.target.value,
              });
            }}
            value={formData.dirección}
            autoComplete="none"
            className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            pattern="^.{2,}$"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Dirección debe tener minimo 2 caracteres
          </span>
        </div>
        <div className="relative w-full">
          <input
            type={visible ? "text" : "password"}
            placeholder="Contraseña"
            onChange={(e) =>
              setFormData({
                ...formData,
                contraseña: e.target.value,
              })
            }
            value={formData.contraseña}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            name="password"
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$¡!%*¿?&#^_+\-=<>\\./,\[\]{}\(\):;|~])[A-Za-z\d@$¡!%*¿?&#^_+\-=<>\\./,\[\]{}\(\):;|~]{8,}$"
            autoComplete="new-password"
            required
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Contraseña debe tener minimo 8 caracteres, contener una letra
            mayuscula, una letra minúscula, un número y un carácter especial
          </span>
          {visible ? (
            <On
              onClick={() => setVisible(false)}
              className="absolute top-2 right-4 fill-[#2096ed]"
            />
          ) : (
            <Off
              onClick={() => setVisible(true)}
              className="absolute top-2 right-4 fill-[#2096ed]"
            />
          )}
        </div>
        <div className="flex w-full justify-between items-center">
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cancelar
            </button>
            <button className="group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
              Completar
            </button>
          </div>
        </div>
      </form>
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
  const [documentType, setDocumentType] = useState<Selected>({
    value: cliente?.documento?.startsWith("V") ? "V" : "RIF",
    label: cliente?.documento?.startsWith("V") ? "V" : "RIF",
  });
  const [formData, setFormData] = useState<Cliente>({
    ...cliente!,
    contraseña: "",
    documento: cliente?.documento?.startsWith("V")
      ? cliente?.documento?.slice(2)
      : cliente?.documento,
  });
  const [visible, setVisible] = useState(false);

  const resetFormData = () => {
    setFormData({
      ...cliente!,
      contraseña: "",
      documento: cliente?.documento?.startsWith("V")
        ? cliente?.documento?.slice(2)
        : cliente?.documento,
    });
    setDocumentType({
      value: cliente?.documento?.startsWith("V") ? "V" : "RIF",
      label: cliente?.documento?.startsWith("V") ? "V" : "RIF",
    });
    setVisible(false);
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
      className="w-2/5 h-fit rounded-md shadow text-base font-normal text-black"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar cliente</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando cliente...");
          let updatedFormData = { ...formData };
          updatedFormData.documento =
            documentType.value === "V"
              ? "V-" + formData.documento
              : formData.documento;
          ClientService.update(cliente?.id!, updatedFormData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data) {
              toast.success("Cliente editado con exito.");
            } else {
              toast.error("Cliente no pudo ser editado.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        <div className="flex gap-2">
          <div className="w-2/4">
            <input
              type="text"
              placeholder="Nombre*"
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
            <input
              type="text"
              placeholder="Apellido"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  apellido: e.target.value,
                });
              }}
              value={formData.apellido}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^.{2,}$"
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Minimo 2 caracteres
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex w-2/4 gap-1">
            <div className="relative w-[28%]">
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
                    value: "RIF",
                    label: "RIF",
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
            <div className="w-[72%]">
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
                className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
                pattern={
                  documentType.value === "RIF"
                    ? "^[A-Za-z]-?\\d{1,9}-?\\d?$"
                    : "^\\d{1,3}\\.\\d{3}\\.\\d{3}$"
                }
              />
              <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
                {documentType.value === "RIF"
                  ? "Formato: J-30684267-5"
                  : "Formato: 29.946.012"}
              </span>
            </div>
          </div>
          <div className="w-2/4">
            <input
              type="tel"
              placeholder="Teléfono"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  telefono: e.target.value,
                });
              }}
              value={formData.telefono}
              className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
              pattern="^\+(?:[0-9]●?){6,14}[0-9]$"
              required={formData.enviarMensajes}
            />
            <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
              Teléfono debe estar en formato E.164
            </span>
          </div>
        </div>
        <div className="w-full">
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            onChange={(e) => {
              setFormData({
                ...formData,
                email: e.target.value,
              });
            }}
            value={formData.email}
            className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            E-mail invalido
          </span>
        </div>
        <div className="w-full">
          <input
            type="text"
            placeholder="Dirección"
            onChange={(e) => {
              setFormData({
                ...formData,
                dirección: e.target.value,
              });
            }}
            value={formData.dirección}
            autoComplete="none"
            className="border border-slate-300 p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            pattern="^.{2,}$"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Dirección debe tener minimo 2 caracteres
          </span>
        </div>
        <div className="relative w-full">
          <input
            type={visible ? "text" : "password"}
            placeholder="Nueva contraseña"
            onChange={(e) =>
              setFormData({
                ...formData,
                contraseña: e.target.value,
              })
            }
            value={formData.contraseña}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-full peer invalid:[&:not(:placeholder-shown)]:border-red-500 invalid:[&:not(:placeholder-shown)]:text-red-500"
            name="password"
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$¡!%*¿?&#^_+\-=<>\\./,\[\]{}\(\):;|~])[A-Za-z\d@$¡!%*¿?&#^_+\-=<>\\./,\[\]{}\(\):;|~]{8,}$"
            autoComplete="new-password"
          />
          <span className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):invalid]:block">
            Contraseña debe tener minimo 8 caracteres, contener una letra
            mayuscula, una letra minúscula, un número y un carácter especial
          </span>
          {visible ? (
            <On
              onClick={() => setVisible(false)}
              className="absolute top-2 right-4 fill-[#2096ed]"
            />
          ) : (
            <Off
              onClick={() => setVisible(true)}
              className="absolute top-2 right-4 fill-[#2096ed]"
            />
          )}
        </div>
        <div className="flex w-full justify-between items-center">
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
          <div className="flex gap-2">
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
            <button className="group-invalid:pointer-events-none group-invalid:opacity-30 bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300">
              Completar
            </button>
          </div>
        </div>
      </form>
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
      className="w-2/5 h-fit rounded-xl shadow text-base"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando cliente...");
          ClientService.delete(cliente?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Cliente eliminado con exito.");
            } else {
              toast.error("Cliente no pudo ser eliminado.");
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
      className="w-1/3 h-fit rounded-md shadow text-base"
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

function DataRow({ cliente, setOperationAsCompleted }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const [action, setAction] = useState<`${Action}`>(
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.editar.cliente
      ? "EDIT"
      : permissions.find()?.eliminar.cliente
      ? "DELETE"
      : permissions.find()?.ver.elemento
      ? "VIEW_ELEMENTS"
      : "NONE"
  );
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);
  const anyAction =
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
    permissions.find()?.editar.cliente
      ? true
      : permissions.find()?.eliminar.cliente
      ? true
      : permissions.find()?.ver.elemento
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
        {cliente?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        {cliente?.nombre} {cliente?.apellido}
      </td>
      <td className="px-6 py-4 border border-slate-300">
        {cliente?.documento
          ? cliente.documento !== ""
            ? cliente.documento
            : "N/A"
          : "N/A"}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[150px]">
        {cliente?.email
          ? cliente.email !== ""
            ? cliente.email
            : "N/A"
          : "N/A"}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        {cliente?.telefono
          ? cliente.telefono !== ""
            ? cliente.telefono
            : "N/A"
          : "N/A"}
      </td>
      <td className="px-6 py-4 border border-slate-300 truncate max-w-[200px]">
        {cliente?.dirección
          ? cliente.dirección !== ""
            ? cliente.dirección
            : "N/A"
          : "N/A"}
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
        {action === "VIEW_ELEMENTS" && (
          <>
            <button
              onClick={() => {
                navigate(`/clientes/${cliente?.id}/elementos`);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Elementos
            </button>
          </>
        )}
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => {}}
            openSearchModal={() => {}}
            id={cliente?.id}
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
            id={`acciones-btn-${cliente?.id}`}
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
          right-8
          top-14
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
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        permissions.find()?.crear.cliente) && (
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
            Editar cliente
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol == "ADMINISTRADOR" ||
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
            Eliminar cliente
          </div>
        </li>
      )}
      {(session.find()?.usuario.rol === "ADMINISTRADOR" ||
        (permissions.find()?.editar.cliente &&
          permissions.find()?.eliminar.cliente)) && (
        <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      )}
      {(session.find()?.usuario.rol == "ADMINISTRADOR" ||
        permissions.find()?.ver.elemento) && (
        <li>
          <div
            onClick={() => {
              selectAction("VIEW_ELEMENTS");
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
            Elementos
          </div>
        </li>
      )}
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
    session.find()?.usuario.rol === "ADMINISTRADOR" ||
      permissions.find()?.crear.cliente
      ? "ADD"
      : "SEARCH"
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
  const isPrecise = useClientSearchParamStore((state) => state.isPrecise);
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
    if (searchCount === 0) {
      ClientService.getAll(page, 8).then((data) => {
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
        const loadingToast = toast.loading("Buscando...");
        if (param === "NOMBRE") {
          ClientService.getByExactNombre(input, page, 8).then((data) => {
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
          ClientService.getByExactApellido(input, page, 8).then((data) => {
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
          ClientService.getByExactTelefono(input, page, 8).then((data) => {
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
          ClientService.getByExactDocumento(input, page, 8).then((data) => {
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
      } else if (!isPrecise && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        if (param === "NOMBRE") {
          ClientService.getByNombre(input, page, 8).then((data) => {
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
          ClientService.getByApellido(input, page, 8).then((data) => {
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
          ClientService.getByTelefono(input, page, 8).then((data) => {
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
          ClientService.getByDocumento(input, page, 8).then((data) => {
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
      <div className="absolute h-full w-full px-8 py-5">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed] cursor-pointer">Clientes</span>
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
                Añadir cliente
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
                  Buscar cliente
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
        {clientes.length > 0 && loading == false && (
          <div className="relative overflow-x-auto">
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
                {clientes.map((cliente) => {
                  return (
                    <DataRow
                      action={""}
                      cliente={cliente}
                      setOperationAsCompleted={setAsCompleted}
                      key={cliente.id}
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
