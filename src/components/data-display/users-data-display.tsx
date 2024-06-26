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
  UsuarioRol,
  Permisos,
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

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
  const [last, setLast] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedRole, setSelectedRole] = useState<Selected>({
    value: "",
    label: "Seleccionar rol",
  });
  const [formData, setFormData] = useState<Usuario>({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    rol: "EMPLEADO",
    contraseña: "",
    creado_por: {
      lista: [],
    },
  });
  const [permisos, setPermisos] = useState<Permisos>();
  const [visible, setVisible] = useState(false);
  const [isTaken, setIsTaken] = useState(false);
  const [stillWriting, setStillWriting] = useState(false);
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  let iniciales: Permisos = {
    ver: {
      cliente: false,
      ticket: false,
      elemento: false,
      problema: false,
      mensaje: false,
      servicio: false,
      operación: false,
      categoría: false,
      imagen: false,
      venta: false,
      compra: false,
      publicación: false,
      proveedor: false,
      reporte: false,
      mensajería: false,
      producto: false,
    },
    crear: {
      cliente: false,
      ticket: false,
      elemento: false,
      problema: false,
      mensaje: false,
      servicio: false,
      operación: false,
      categoría: false,
      imagen: false,
      venta: false,
      compra: false,
      publicación: false,
      proveedor: false,
      reporte: false,
      mensajería: false,
      producto: false,
    },
    editar: {
      cliente: false,
      ticket: false,
      elemento: false,
      problema: false,
      mensaje: false,
      servicio: false,
      operación: false,
      categoría: false,
      imagen: false,
      venta: false,
      compra: false,
      publicación: false,
      proveedor: false,
      reporte: false,
      mensajería: false,
      producto: false,
    },
    eliminar: {
      cliente: false,
      ticket: false,
      elemento: false,
      problema: false,
      mensaje: false,
      servicio: false,
      operación: false,
      categoría: false,
      imagen: false,
      venta: false,
      compra: false,
      publicación: false,
      proveedor: false,
      reporte: false,
      mensajería: false,
      producto: false,
    },
  };

  const resetFormData = () => {
    setFormData({
      nombre: "",
      apellido: "",
      rol: "EMPLEADO",
      nombreUsuario: "",
      contraseña: "",
    });
    setSelectedRole({
      value: "",
      label: "Seleccionar rol",
    });
    setLast(false);
    iniciales = {
      ver: {
        cliente: false,
        ticket: false,
        elemento: false,
        problema: false,
        mensaje: false,
        servicio: false,
        operación: false,
        categoría: false,
        imagen: false,
        venta: false,
        compra: false,
        publicación: false,
        proveedor: false,
        reporte: false,
        mensajería: false,
        producto: false,
      },
      crear: {
        cliente: false,
        ticket: false,
        elemento: false,
        problema: false,
        mensaje: false,
        servicio: false,
        operación: false,
        categoría: false,
        imagen: false,
        venta: false,
        compra: false,
        publicación: false,
        proveedor: false,
        reporte: false,
        mensajería: false,
        producto: false,
      },
      editar: {
        cliente: false,
        ticket: false,
        elemento: false,
        problema: false,
        mensaje: false,
        servicio: false,
        operación: false,
        categoría: false,
        imagen: false,
        venta: false,
        compra: false,
        publicación: false,
        proveedor: false,
        reporte: false,
        mensajería: false,
        producto: false,
      },
      eliminar: {
        cliente: false,
        ticket: false,
        elemento: false,
        problema: false,
        mensaje: false,
        servicio: false,
        operación: false,
        categoría: false,
        imagen: false,
        venta: false,
        compra: false,
        publicación: false,
        proveedor: false,
        reporte: false,
        mensajería: false,
        producto: false,
      },
    };
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
        <h1 className="text-xl font-bold text-white">Añadir usuario</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
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

          const loadingToast = toast.loading("Añadiendo usuario...");

          UserService.create(newFormData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Usuario no pudo ser añadido.");
            } else {
              let createPermisos = { ...permisos };
              createPermisos.usuario_id = data.id;
              if (createPermisos) {
                //@ts-ignore
                UserService.postPermissionsById(data.id!, createPermisos);
              }
              toast.success("Usuario añadido con exito.");
            }
          });
        }}
      >
        {last && selectedRole.value === "EMPLEADO" ? (
          <PermissionPanel
            permisos={iniciales}
            onChange={(p) => {
              setPermisos(p);
            }}
          />
        ) : (
          <>
            <div className="flex gap-4 w-full">
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
            <div className="flex gap-4">
              <div className="w-2/4">
                <input
                  type="text"
                  placeholder="Nombre de usuario*"
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
                <Select
                  onChange={() => {
                    setFormData({
                      ...formData,
                      rol: selectedRole.value as UsuarioRol,
                    });
                  }}
                  options={[
                    {
                      value: "ADMINISTRADOR",
                      label: "Administrador",
                      onClick: (value, label) => {
                        setSelectedRole({
                          value,
                          label,
                        });
                      },
                    },
                    {
                      value: "EMPLEADO",
                      label: "Empleado",
                      onClick: (value, label) => {
                        setSelectedRole({
                          value,
                          label,
                        });
                      },
                    },
                  ]}
                  selected={selectedRole}
                />
              </div>
            </div>
            <div className="relative w-full">
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
                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$¡!%*¿?&#^_+\-=<>\\./,\[\]{}\(\):;|~])[A-Za-z\d@$¡!%*¿?&#^_+\-=<>\\./,\[\]{}\(\):;|~]{8,}$"
                required
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
          </>
        )}
        <div className="flex w-full justify-between">
          {last === false && selectedRole.label === "Empleado" ? (
            <button
              type="button"
              onClick={() => setLast(true)}
              className="text-[#2096ed] bg-blue-100 font-semibold rounded-lg p-2 px-4 hover:bg-blue-200 transition ease-in-out delay-100 duration-300"
            >
              Permisos
            </button>
          ) : last === true && selectedRole.label === "Empleado" ? null : (
            <div></div>
          )}
          {last === true && selectedRole.label === "Empleado" ? (
            <button
              type="button"
              onClick={() => setLast(false)}
              className="text-[#2096ed] bg-blue-100 font-semibold rounded-lg p-2 px-4 hover:bg-blue-200 transition ease-in-out delay-100 duration-300"
            >
              Volver
            </button>
          ) : (
            <div></div>
          )}
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
                  selectedRole.label?.startsWith("Seleccionar") || 
                  !(pattern.test(formData?.contraseña || "")),
              })}
            >
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
  usuario,
}: ModalProps) {
  const [last, setLast] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedRole, setSelectedRole] = useState<Selected>({
    value: usuario?.rol,
    label: usuario?.rol === "ADMINISTRADOR" ? "Administrador" : "Empleado",
  });
  const [formData, setFormData] = useState<Usuario>({
    ...usuario!,
    contraseña: "",
  });
  const [permisos, setPermisos] = useState<Permisos | undefined>(
    usuario?.permiso!
  );
  const [visible, setVisible] = useState(false);
  const [isTaken, setIsTaken] = useState(false);
  const [stillWriting, setStillWriting] = useState(false);

  const resetFormData = () => {
    setFormData({
      ...usuario!,
      contraseña: "",
    });
    setSelectedRole({
      value: usuario?.rol,
      label: usuario?.rol === "ADMINISTRADOR" ? "Administrador" : "Empleado",
    });
    setPermisos(usuario?.permiso!);
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
      className="w-2/5 h-fit rounded-md shadow-md text-base font-normal"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">
          {" "}
          {session.find()?.usuario.id === usuario?.id
            ? "Editar tu usuario"
            : "Editar usuario"}
        </h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4 group"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando usuario...");
          UserService.update(usuario?.id!, formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data) {
              if (permisos) {
                UserService.patchPermissionsById(formData.id!, permisos);
              }
              toast.success("Usuario editado con exito.");
            } else {
              toast.error("Usuario no pudo ser editado.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        {last ? (
          <PermissionPanel
            permisos={formData.permiso!}
            onChange={(p) => {
              setPermisos(p);
            }}
          />
        ) : (
          <>
            <div className="flex gap-4 w-full">
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
              <div className="w-2/4">
                <input
                  type="text"
                  placeholder="Nombre de usuario*"
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
                <select
                  className="select-none border w-full p-2 rounded outline-none focus:border-[#2096ed] appearance-none text-slate-400 font-medium bg-slate-100"
                  value={selectedRole.value}
                  disabled={true}
                >
                  <option value={selectedRole.value}>
                    {selectedRole.label}
                  </option>
                </select>
                <Down className="absolute h-4 w-4 top-3 right-5 fill-slate-300" />
              </div>
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
          </>
        )}
        <div className="flex w-full justify-between">
          {last === false && selectedRole.label === "Empleado" ? (
            <button
              type="button"
              onClick={() => setLast(true)}
              className="text-[#2096ed] bg-blue-100 font-semibold rounded-lg p-2 px-4 hover:bg-blue-200 transition ease-in-out delay-100 duration-300"
            >
              Permisos
            </button>
          ) : last === true && selectedRole.label === "Empleado" ? null : (
            <div></div>
          )}
          {last === true && selectedRole.label === "Empleado" ? (
            <button
              type="button"
              onClick={() => setLast(false)}
              className="text-[#2096ed] bg-blue-100 font-semibold rounded-lg p-2 px-4 hover:bg-blue-200 transition ease-in-out delay-100 duration-300"
            >
              Volver
            </button>
          ) : (
            <div></div>
          )}
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
        </div>
      </form>
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
      className="w-2/5 h-fit rounded-md shadow-md text-base"
    >
      <form
        className="flex flex-col p-8 pt-6 gap-4 justify-center"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Eliminando usuario...");
          UserService.delete(usuario?.id!).then((data) => {
            toast.dismiss(loadingToast);
            if (data) {
              toast.success("Usuario eliminado con exito.");
            } else {
              toast.error("Usuario no pudo ser eliminado.");
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

function DataRow({ usuario, setOperationAsCompleted }: DataRowProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [action, setAction] = useState<`${Action}`>("EDIT");
  const [isDropup, setIsDropup] = useState(false);
  const ref = useRef<HTMLTableCellElement>(null);

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
        {usuario?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300">
        {usuario?.nombre} {usuario?.apellido}
      </td>
      <td className="px-6 py-2 border border-slate-300">
        <div className="bg-gray-200 text-center text-gray-600 text-xs py-2 font-bold rounded-lg">
          {usuario?.nombreUsuario}{" "}
          {session.find()?.usuario?.id === usuario?.id ? "(Tu usuario)" : null}
        </div>
      </td>
      <td className="px-6 py-2 border border-slate-300">
        {" "}
        {usuario?.rol === "EMPLEADO" ? (
          <div className="bg-green-200 text-center text-green-600 text-xs py-2 font-bold rounded-lg">
            Empleado
          </div>
        ) : (
          <div className="bg-blue-200 text-center text-blue-600 text-xs py-2 font-bold rounded-lg">
            Administrador
          </div>
        )}
      </td>
      <td ref={ref} className="px-6 py-3 w-52 border border-slate-300 relative">
        {action === "EDIT" && (
          <>
            {usuario?.rol === "EMPLEADO" ||
            //@ts-ignore
            usuario?.creado_por?.lista?.find(
              (id) => session.find()?.usuario.id === id
            ) ||
            session.find()?.usuario.id === usuario?.id ? (
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
            )}
          </>
        )}
        {action === "DELETE" && (
          <>
            {usuario?.rol === "EMPLEADO" ||
            //@ts-ignore
            usuario?.creado_por?.lista?.find(
              (id) => session.find()?.usuario.id === id
            ) ||
            session.find()?.usuario.id === usuario?.id ? (
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
            )}
          </>
        )}
        {isDropup && (
          <IndividualDropup
            close={() => setIsDropup(false)}
            selectAction={selectAction}
            openAddModal={() => {}}
            openSearchModal={() => {}}
            id={usuario?.id}
            top={
              ref?.current?.getBoundingClientRect().top! +
              window.scrollY +
              ref?.current?.getBoundingClientRect().height! -
              15
            }
            right={
              ref?.current?.getBoundingClientRect().left! + window.scrollX + 45
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
      className="w-1/3 h-fit rounded-md shadow text-base"
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

type PermissionPanelProps = {
  onChange: (permissions: Permisos) => void;
  permisos: Permisos;
};

function PermissionPanel({ onChange, permisos }: PermissionPanelProps) {
  const [permissions, setPermissions] = useState<Permisos>(permisos);

  useEffect(() => {
    onChange(permissions);
  }, [permissions]);

  return (
    <div className="max-h-[300px] overflow-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100 scrollbar-rounded-xl text-sm">
      <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg">
        Clientes
      </div>
      <div className="ml-5 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox1"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  cliente: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.cliente}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox1"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox2"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  cliente: true,
                },
                crear: {
                  ...permissions.crear,
                  cliente: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.cliente}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox2"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox3"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  cliente: true,
                },
                editar: {
                  ...permissions.editar,
                  cliente: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.cliente}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox3"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox4"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  cliente: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  cliente: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.cliente}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox4"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="ml-5 mt-2 font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg">
        Elementos
      </div>
      <div className="ml-10 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox111"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  elemento: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.elemento}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox111"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox112"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  elemento: true,
                },
                crear: {
                  ...permissions.crear,
                  elemento: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.elemento}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox112"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox113"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  elemento: true,
                },
                editar: {
                  ...permissions.editar,
                  elemento: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.elemento}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox113"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox114"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  elemento: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  elemento: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.elemento}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox114"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
        Tickets
      </div>
      <div className="ml-5 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox5"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  ticket: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.ticket}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox5"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox6"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  ticket: true,
                },
                crear: {
                  ...permissions.crear,
                  ticket: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.ticket}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox6"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox7"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  ticket: true,
                },
                editar: {
                  ...permissions.editar,
                  ticket: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.ticket}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox7"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox8"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  ticket: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  ticket: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.ticket}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox8"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="ml-5 mt-2 font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg">
        Servicios
      </div>
      <div className="ml-10 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox1111"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  servicio: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.servicio}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox1111"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox1112"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  servicio: true,
                },
                crear: {
                  ...permissions.crear,
                  servicio: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.servicio}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox1112"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox1113"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  servicio: true,
                },
                editar: {
                  ...permissions.editar,
                  servicio: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.servicio}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox1113"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox1114"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  servicio: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  servicio: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.servicio}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox1114"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="ml-10 mt-2 font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg">
        Operaciones
      </div>
      <div className="ml-16 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox2111"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  operación: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.operación}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox2111"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox2112"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  operación: true,
                },
                crear: {
                  ...permissions.crear,
                  operación: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.operación}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox2112"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox2113"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  operación: true,
                },
                editar: {
                  ...permissions.editar,
                  operación: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.operación}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox2113"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox2114"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  operación: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  operación: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.operación}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox2114"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="ml-5 mt-2 font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg">
        Problemas
      </div>
      <div className="ml-10 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox3111"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  problema: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.problema}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox3111"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox3112"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  problema: true,
                },
                crear: {
                  ...permissions.crear,
                  problema: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.problema}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox3112"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox3113"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  problema: true,
                },
                editar: {
                  ...permissions.editar,
                  problema: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.problema}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox3113"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox3114"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  problema: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  problema: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.problema}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox3114"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="ml-5 mt-2 font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg">
        Mensajes
      </div>
      <div className="ml-10 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox5111"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  mensaje: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.mensaje}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox5111"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox5112"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  mensaje: true,
                },
                crear: {
                  ...permissions.crear,
                  mensaje: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.mensaje}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox5112"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox5113"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  mensaje: true,
                },
                editar: {
                  ...permissions.editar,
                  mensaje: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.mensaje}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox5113"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox5114"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  mensaje: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  mensaje: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.mensaje}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox5114"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
        Publicaciones
      </div>
      <div className="ml-5 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox9"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  publicación: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.publicación}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox9"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox10"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  publicación: true,
                },
                crear: {
                  ...permissions.crear,
                  publicación: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.publicación}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox10"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox11"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  publicación: true,
                },
                editar: {
                  ...permissions.editar,
                  publicación: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.publicación}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox11"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox12"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  publicación: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  publicación: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.publicación}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox12"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
        Productos
      </div>
      <div className="ml-5 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox13"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  producto: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.producto}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox13"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox14"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  producto: true,
                },
                crear: {
                  ...permissions.crear,
                  producto: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.producto}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox14"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox15"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  producto: true,
                },
                editar: {
                  ...permissions.editar,
                  producto: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.producto}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox15"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox16"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  producto: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  producto: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.producto}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox16"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
        Proveedores
      </div>
      <div className="ml-5 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox17"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  proveedor: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.proveedor}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox17"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox18"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  proveedor: true,
                },
                crear: {
                  ...permissions.crear,
                  proveedor: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.proveedor}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox18"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox19"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  proveedor: true,
                },
                editar: {
                  ...permissions.editar,
                  proveedor: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.proveedor}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox19"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox20"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  proveedor: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  proveedor: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.proveedor}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox20"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
        Ventas
      </div>
      <div className="ml-5 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox21"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  venta: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.venta}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox21"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox22"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  venta: true,
                },
                crear: {
                  ...permissions.crear,
                  venta: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.venta}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox22"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox23"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  venta: true,
                },
                editar: {
                  ...permissions.editar,
                  venta: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.venta}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox23"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox24"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  venta: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  venta: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.venta}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox24"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
        Compras
      </div>
      <div className="ml-5 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox25"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  compra: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.compra}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox25"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox26"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  compra: true,
                },
                crear: {
                  ...permissions.crear,
                  compra: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.compra}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox26"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox27"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  compra: true,
                },
                editar: {
                  ...permissions.editar,
                  compra: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.compra}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox27"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox28"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  compra: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  compra: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.compra}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox28"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
        Categorías
      </div>
      <div className="ml-5 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox29"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  categoría: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.categoría}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox29"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox30"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  categoría: true,
                },
                crear: {
                  ...permissions.crear,
                  categoría: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.categoría}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox30"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox31"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  categoría: true,
                },
                editar: {
                  ...permissions.editar,
                  categoría: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.categoría}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox31"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox32"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  categoría: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  categoría: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.categoría}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox32"
          >
            ELIMINAR
          </label>
        </div>
      </div>
      <div className="font-medium leading-tight uppercase text-[#2096ed] bg-blue-100 w-fit p-1 px-2 rounded-lg mt-2">
        Galería
      </div>
      <div className="ml-5 mt-2 flex gap-4">
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox229"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  imagen: e.target.checked,
                },
              });
            }}
            checked={permissions.ver.imagen}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox229"
          >
            VER
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox230"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  imagen: true,
                },
                crear: {
                  ...permissions.crear,
                  imagen: e.target.checked,
                },
              });
            }}
            checked={permissions.crear.imagen}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox230"
          >
            CREAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox231"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  imagen: true,
                },
                editar: {
                  ...permissions.editar,
                  imagen: e.target.checked,
                },
              });
            }}
            checked={permissions.editar.imagen}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox231"
          >
            EDITAR
          </label>
        </div>
        <div className="mb-[0.125rem] min-h-[1.5rem] block">
          <input
            className="mr-1 leading-tight w-4 h-4 accent-[#2096ed] bg-gray-100 border-gray-300 rounded focus:ring-[#2096ed]"
            type="checkbox"
            id="checkbox232"
            onChange={(e) => {
              setPermissions({
                ...permissions,
                ver: {
                  ...permissions.ver,
                  imagen: true,
                },
                eliminar: {
                  ...permissions.eliminar,
                  imagen: e.target.checked,
                },
              });
            }}
            checked={permissions.eliminar.imagen}
          />
          <label
            className="inline-block pl-[0.15rem] hover:cursor-pointer text-gray-600 font-medium"
            htmlFor="checkbox232"
          >
            ELIMINAR
          </label>
        </div>
      </div>
    </div>
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
      UserService.getAll(page, 7).then((data) => {
        if (data === false) {
          setNotFound(true);
          setLoading(false);
          setUsers([]);
          setWasSearch(false);
          resetSearchCount();
        } else {
          if (!currentUser) {
            UserService.getById(session.find()?.usuario.id!).then((user) => {
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
            });
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
          UserService.getByExactNombre(input, page, 7).then((data) => {
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
          UserService.getByExactApellido(input, page, 7).then((data) => {
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
          UserService.getByExactNombreUsuario(input, page, 7).then((data) => {
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
        }
      } else if (!isPrecise && wasSearch) {
        const loadingToast = toast.loading("Buscando...");
        if (param === "NOMBRE") {
          UserService.getByNombre(input, page, 7).then((data) => {
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
          UserService.getByApellido(input, page, 7).then((data) => {
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
          UserService.getByNombreUsuario(input, page, 7).then((data) => {
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
            <span
              onClick={resetSearchCount}
              className="text-[#2096ed] cursor-pointer"
            >
              Usuarios
            </span>
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
                    Nombre de usuario
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
