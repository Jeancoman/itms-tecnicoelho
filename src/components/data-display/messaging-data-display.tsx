import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "/src/assets/chevron-right-solid.svg";
import { ReactComponent as More } from "/src/assets/more_vert.svg";
import { ReactComponent as Face } from "/src/assets/report.svg";
import { ReactComponent as Check } from "/src/assets/check_circle.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Plantilla,
  Mensajería,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import TemplateService from "../../services/template-service";
import MessagingOptionsService from "../../services/messaging-options-service";
import Editor from "react-simple-code-editor";
import hljs from "highlight.js/lib/core";
import options from "../../utils/options";
import { Socket, io } from "socket.io-client";
import MessageSenderService from "../../services/message-sender-service";
import permissions from "../../utils/permissions";
import { createRowNumber } from "../../utils/functions";

hljs.registerLanguage("tecniplantilla", () => {
  return {
    case_insensitive: false,
    keywords: "SI SINO SINO PERO BASE FIN",
    contains: [
      {
        scope: "variable",
        begin: /\{\{/,
        end: /\}\}/,
      },
      hljs.COMMENT("/\\*", "\\*/"),
    ],
  };
});

function MessengerModal({ isOpen, closeModal }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [socket, setSocket] = useState<Socket>();
  const [isOn, setIsOn] = useState(false);
  const [status, setStatus] = useState("");
  const [QRCode, setQRCode] = useState("");
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout>();

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_MENSAJERO_URL}/ping`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Connection: "keep-alive",
          },
        }
      );
      if (response.ok) {
        const socket = io(`${import.meta.env.VITE_MENSAJERO_URL}`);
        setSocket(socket);
        setIsOn(true);
      } else {
        const timeout = setTimeout(checkBackendStatus, 5000);
        setTimeoutID(timeout);
      }
    } catch (error) {
      const timeout = setTimeout(checkBackendStatus, 5000);
      setTimeoutID(timeout);
    }
  };

  useEffect(() => {
    if (status === "") {
      void MessageSenderService.status().then((data) => {
        if (data !== false) {
          setStatus(data.status);
        }
      });
    }

    if (QRCode === "") {
      MessageSenderService.qr();
    }
  }, [status]);

  useEffect(() => {
    void checkBackendStatus();

    return () => {
      clearTimeout(timeoutID);
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("qr", (value) => {
        if (value) {
          setQRCode(value);
        }
      });

      socket.on("status", (value) => {
        setStatus(value);
      });
    }

    return () => {
      socket?.off("qr");
      socket?.off("status");
    };
  }, [socket]);

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
        <h1 className="text-xl font-bold text-white">Configurar mensajero</h1>
      </div>
      <div className="flex flex-col p-8 pt-6 gap-4">
        {isOn === false ? (
          <div className="flex flex-col items-center gap-2">
            <div className="grid w-full h-4/5">
              <div className="place-self-center">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="inline w-20 h-20 mr-2 text-blue-200 animate-spin dark:text-gray-600 fill-[#2096ed]"
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
            <p className="font-medium">
              Estableciendo conexión con el servicio mensajero...
            </p>
          </div>
        ) : status === "CONECTADO" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="grid w-full h-4/5">
              <Check className="place-self-center h-24 w-24 fill-green-400" />
            </div>
            <p className="font-medium">Sesión de mensajero activa</p>
          </div>
        ) : status === "DESCONECTADO" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="grid w-fit h-4/5">
              {QRCode !== "" ? (
                <img src={QRCode} className="place-self-center h-68 w-80" />
              ) : (
                <div className="place-self-center">
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="inline w-20 h-20 mr-2 text-blue-200 animate-spin dark:text-gray-600 fill-[#2096ed]"
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
              )}
            </div>
            <p className="font-medium">
              {QRCode !== ""
                ? "Escaneé el código QR para activar el servicio"
                : "Esperando código QR..."}
            </p>
          </div>
        ) : null}
        <div className="flex w-full justify-center items-center">
          <div className="flex gap-2">
            <button
              onClick={closeModal}
              className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

function ViewModal({ isOpen, closeModal, plantilla }: ModalProps) {
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
        <h1 className="text-xl font-bold text-white">Datos de la plantilla</h1>
      </div>
      <div className="p-8 pt-6">
        <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* NOMBRE */}
            <div className="col-span-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Contenido
              </p>
              <div className="max-h-[300px] overflow-auto bg-slate-50 scrollbar">
                <Editor
                  value={plantilla?.contenido || ""}
                  onValueChange={() => null}
                  readOnly
                  highlight={(code) => {
                    console.log(
                      hljs.highlight(code, { language: "tecniplantilla" }).value
                    );
                    return hljs.highlight(code, {
                      language: "tecniplantilla",
                    }).value;
                  }}
                  padding={10}
                  style={{
                    fontFamily: '"consolas", "Fira Mono", monospace',
                    fontSize: 14,
                  }}
                  textareaClassName="outline-none"
                  preClassName="language-tecniplantilla"
                  className="min-h-[300px]"
                />
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

function OptionModal({ isOpen, closeModal, mensajería }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [formData, setFormData] = useState<Mensajería>(mensajería!);

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
        <h1 className="text-xl font-bold text-white">Configurar mensajería</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading(
            "Editando configuración de mensajería..."
          );
          MessagingOptionsService.update(formData).then((data) => {
            toast.dismiss(loadingToast);
            if (data === false) {
              toast.error("Nensajería no pudo ser editada.");
            } else {
              options.set(formData.opciones);
              toast.success("Mensajería editada exitosamente.");
            }
          });
        }}
      >
        <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg">
          Creación automática de mensajes
        </div>
        <div className="ml-5 mt-2 flex gap-4">
          <div className="mb-[0.125rem] min-h-[1.5rem] block">
            <input
              className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
              type="checkbox"
              id="checkbox1"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  opciones: {
                    ...formData.opciones,
                    creación: {
                      nunca: e.target.checked,
                      siempre: false,
                      preguntar: false,
                    },
                  },
                });
              }}
              checked={formData.opciones.creación.nunca}
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox1"
            >
              DESACTIVADO
            </label>
          </div>
          <div className="mb-[0.125rem] min-h-[1.5rem] block">
            <input
              className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
              type="checkbox"
              id="checkbox2"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  opciones: {
                    ...formData.opciones,
                    creación: {
                      nunca: false,
                      siempre: e.target.checked,
                      preguntar: false,
                    },
                  },
                });
              }}
              checked={formData.opciones.creación.siempre}
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox2"
            >
              ACTIVADA
            </label>
          </div>
        </div>
        <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
          Envio automático de mensajes
        </div>
        <div className="ml-5 mt-2 flex gap-4">
          <div className="mb-[0.125rem] min-h-[1.5rem] block">
            <input
              className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
              type="checkbox"
              id="checkbox5"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  opciones: {
                    ...formData.opciones,
                    envio: {
                      nunca: e.target.checked,
                      siempre: false,
                      preguntar: false,
                    },
                  },
                });
              }}
              checked={formData.opciones.envio.nunca}
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox5"
            >
              DESACTIVADO
            </label>
          </div>
          <div className="mb-[0.125rem] min-h-[1.5rem] block">
            <input
              className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
              type="checkbox"
              id="checkbox6"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  opciones: {
                    ...formData.opciones,
                    envio: {
                      nunca: false,
                      siempre: e.target.checked,
                      preguntar: false,
                    },
                  },
                });
              }}
              checked={formData.opciones.envio.siempre}
            />
            <label
              className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
              htmlFor="checkbox6"
            >
              ACTIVADO
            </label>
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
  plantilla,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isConfirmationScreen, setIsConfirmationScreen] = useState(false);
  const [formData, setFormData] = useState<Plantilla>(plantilla!);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmationScreen(true);
  };

  const handleFinalSubmit = () => {
    closeModal();
    const loadingToast = toast.loading("Editando plantilla...");
    TemplateService.update(plantilla?.id!, formData).then((data) => {
      toast.dismiss(loadingToast);
      setOperationAsCompleted();
      if (data) {
        toast.success("Plantilla editada con exito.");
      } else {
        toast.error("Plantilla no pudo ser editada.");
      }
    });
  };

  const renderConfirmationScreen = () => (
    <div className="p-8 pt-6">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6 w-fit">
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
                  Contenido
                </p>
                <div className="max-h-[300px] overflow-auto bg-slate-50 scrollbar">
                  <Editor
                    value={plantilla?.contenido || ""}
                    onValueChange={() => null}
                    readOnly
                    highlight={(code) => {
                      console.log(
                        hljs.highlight(code, { language: "tecniplantilla" })
                          .value
                      );
                      return hljs.highlight(code, {
                        language: "tecniplantilla",
                      }).value;
                    }}
                    padding={10}
                    style={{
                      fontFamily: '"consolas", "Fira Mono", monospace',
                      fontSize: 14,
                    }}
                    textareaClassName="outline-none"
                    preClassName="language-tecniplantilla"
                    className="min-h-[300px]"
                  />
                </div>
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
                  Contenido
                </p>
                <div className="max-h-[300px] overflow-auto bg-slate-50 scrollbar">
                  <Editor
                    value={formData?.contenido || ""}
                    onValueChange={() => null}
                    readOnly
                    highlight={(code) => {
                      console.log(
                        hljs.highlight(code, { language: "tecniplantilla" })
                          .value
                      );
                      return hljs.highlight(code, {
                        language: "tecniplantilla",
                      }).value;
                    }}
                    padding={10}
                    style={{
                      fontFamily: '"consolas", "Fira Mono", monospace',
                      fontSize: 14,
                    }}
                    textareaClassName="outline-none"
                    preClassName="language-tecniplantilla"
                    className="min-h-[300px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setIsConfirmationScreen(false)} // Retorna al formulario
            className="text-gray-500 bg-gray-200 font-semibold rounded-lg py-2 px-4 hover:bg-gray-300 hover:text-gray-700 transition ease-in-out delay-100 duration-300"
          >
            Volver
          </button>
          <button
            onClick={handleFinalSubmit} // Confirmación final
            className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4 hover:bg-[#1182d5] transition ease-in-out delay-100 duration-300"
          >
            Guardar cambios
          </button>
        </div>
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
          {isConfirmationScreen ? "Confirmar cambios" : "Editar plantilla"}
        </h1>
      </div>
      {isConfirmationScreen ? (
        renderConfirmationScreen()
      ) : (
        <form
          className="flex flex-col p-8 pt-6 gap-4"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div className="max-h-[300px] overflow-auto bg-slate-50 scrollbar">
            <Editor
              value={formData.contenido}
              onValueChange={(code) =>
                setFormData({
                  ...formData,
                  contenido: code,
                })
              }
              highlight={(code) => {
                console.log(
                  hljs.highlight(code, { language: "tecniplantilla" }).value
                );
                return hljs.highlight(code, { language: "tecniplantilla" })
                  .value;
              }}
              padding={10}
              style={{
                fontFamily: '"consolas", "Fira Mono", monospace',
                fontSize: 14,
              }}
              textareaClassName="outline-none"
              preClassName="language-tecniplantilla"
              className="min-h-[300px]"
            />
          </div>
          <div className="flex w-full justify-between items-center">
            <div className="mb-[0.125rem] min-h-[1.5rem] justify-self-start flex items-center">
              <input
                className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
                type="checkbox"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    estaActiva: e.target.checked,
                  });
                }}
                checked={formData.estaActiva}
                id="checkbox"
              />
              <label
                className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
                htmlFor="checkbox"
              >
                ¿Esta activa?
              </label>
            </div>
            <div className="flex gap-2 text-base">
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
          </div>
        </form>
      )}
    </dialog>
  );
}

function DataRow({
  plantilla,
  setOperationAsCompleted,
  row_number,
}: DataRowProps) {
  const ref = useRef<HTMLTableCellElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>(
    permissions.find()?.editar.mensajería ? "EDIT" : "VIEW"
  );
  const [isDropup, setIsDropup] = useState(false);

  const closeEditModal = () => {
    setIsEditOpen(false);
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
      <td className="px-6 py-4 border border-slate-300 capitalize">
        {plantilla?.evento}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {plantilla?.estaActiva ? (
          <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-lg capitalize">
            Activa
          </div>
        ) : (
          <div className="bg-gray-200 text-center text-gray-600 text-xs py-2 font-bold rounded-lg capitalize">
            Inactiva
          </div>
        )}
      </td>
      <td
        ref={ref}
        className="px-6 py-3 border border-slate-300 w-[200px] min-w-[200px] truncate relative"
      >
        {action === "EDIT" && (
          <>
            <button
              onClick={() => {
                setIsEditOpen(true);
              }}
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 -ml-2 py-1 px-2 rounded-lg"
            >
              Editar plantilla
            </button>
            <EditModal
              plantilla={plantilla}
              isOpen={isEditOpen}
              closeModal={closeEditModal}
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
              Mostrar plantilla
            </button>
            <ViewModal
              plantilla={plantilla}
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
            id={plantilla?.id}
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
        {permissions.find()?.editar.mensajería ? (
          <button
            id={`acciones-btn-${plantilla?.id}`}
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
      {permissions.find()?.editar.mensajería && (
        <li>
          <div
            onClick={() => {
              selectAction("OPTIONS");
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
            Configurar mensajería
          </div>
        </li>
      )}
      {permissions.find()?.editar.mensajería && (
        <li>
          <div
            onClick={() => {
              selectAction("MESSAGING");
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
            Configurar mensajero
          </div>
        </li>
      )}
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
      {permissions.find()?.editar.mensajería && (
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
            Editar plantilla
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
          Mostrar plantilla
        </div>
      </li>
    </ul>
  );
}

export default function MessagingDataDisplay() {
  const [template, setTemplates] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [isOption, setIsOption] = useState(false);
  const [action, setAction] = useState<`${Action}`>("OPTIONS");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [current, setCurrent] = useState(0);
  const [options, setOptions] = useState<Mensajería>({
    opciones: {
      creación: {
        nunca: true,
        siempre: false,
        preguntar: false,
      },
      envio: {
        nunca: true,
        siempre: false,
        preguntar: false,
      },
    },
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const size = 8;

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
    void TemplateService.getAll(page, size).then((data) => {
      if (data === false) {
        setNotFound(true);
        setLoading(false);
        setTemplates([]);
      } else {
        setTemplates(data.rows);
        setPages(data.pages);
        setCurrent(data.current);
        setLoading(false);
        setNotFound(false);
      }
      setIsOperationCompleted(false);
    });

    void MessagingOptionsService.get().then((data) => {
      if (data) {
        setOptions(data);
      }
    });
  }, [isOperationCompleted, page]);

  return (
    <>
      <div className="absolute h-full w-full px-12 py-5">
        <nav className="flex justify-between items-center select-none max-[380px]:flex-col gap-4">
          <div className="font-medium text-slate-600">
            Menú <Right className="w-3 h-3 inline fill-slate-600" />{" "}
            <span className="text-[#2096ed]">Mensajería</span>
          </div>
          {permissions.find()?.editar.mensajería && (
            <div className="flex gap-2 relative">
              {isDropup && (
                <Dropup
                  close={closeDropup}
                  selectAction={selectAction}
                  openAddModal={() => null}
                />
              )}
              {action === "OPTIONS" ? (
                <button
                  onClick={() => setIsOption(true)}
                  className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                >
                  Configurar mensajería
                </button>
              ) : null}
              {action === "MESSAGING" ? (
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="bg-[#2096ed] hover:bg-[#1182d5] outline-none px-4 py-2 shadow text-white text-sm font-semibold text-center p-1 rounded-md transition ease-in-out delay-100 duration-300"
                >
                  Configurar mensajero
                </button>
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
          )}
        </nav>
        <hr className="border-1 border-slate-300 my-5" />
        {template.length > 0 && loading == false && (
          <div className="relative overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Evento
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 border border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {template.map((template, index) => {
                  return (
                    <DataRow
                      action={action}
                      plantilla={template}
                      setOperationAsCompleted={setAsCompleted}
                      key={template.id}
                      row_number={createRowNumber(current, size, index + 1)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {notFound === true && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningúna plantilla encontrada
              </p>
              <p className="font-medium text text-center mt-1">
                Esto puede deberse a un error del servidor o a problemas de
                conexión.
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
      {template.length > 0 && loading == false && (
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
      <MessengerModal
        isOpen={isAddOpen}
        closeModal={() => setIsAddOpen(false)}
        setOperationAsCompleted={() => null}
      />
      {options ? (
        <OptionModal
          isOpen={isOption}
          closeModal={() => {
            setIsOption(false);
          }}
          setOperationAsCompleted={setAsCompleted}
          mensajería={options}
        />
      ) : null}
    </>
  );
}
