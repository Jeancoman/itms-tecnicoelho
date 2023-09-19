import { useEffect, useRef, useState } from "react";
import { ReactComponent as Right } from "../../assets/chevron-right-solid.svg";
import { ReactComponent as Down } from "../../assets/chevron-down-solid.svg";
import { ReactComponent as Face } from "../../assets/thinking.svg";
import { ReactComponent as Warning } from "../../assets/circle-exclamation-solid.svg";
import Pagination from "../misc/pagination";
import {
  ModalProps,
  DataRowProps,
  DropupProps,
  Action,
  Usuario,
  Selected,
  UsuarioRol,
} from "../../types";
import toast, { Toaster } from "react-hot-toast";
import UserService from "../../services/user-service";
import { format } from "date-fns";
import Select from "../misc/select";

function AddModal({ isOpen, closeModal, setOperationAsCompleted }: ModalProps) {
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
  });

  const resetFormData = () => {
    setFormData({
      nombre: "",
      apellido: "",
      rol: "EMPLEADO",
      nombreUsuario: "",
      contraseña: "",
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
        <h1 className="text-xl font-bold text-white">Crear usuario</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Crear usuario...");
          UserService.create(formData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data === false) {
              toast.error("Usuario no pudo ser creado.");
            } else {
              toast.success("Usuario creado con exito.");
            }
          });
        }}
      >
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nombre"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
              });
            }}
            value={formData.nombre}
            className="border p-2 rounded outline-none focus:border-[#2096ed]"
          />
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
            className="border p-2 rounded outline-none focus:border-[#2096ed]"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre de usuario*"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombreUsuario: e.target.value,
              });
            }}
            value={formData.nombreUsuario}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/4"
          />
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
                  value: "SUPERADMINISTRADOR",
                  label: "Superadministrador",
                  onClick: (value, label) => {
                    setSelectedRole({
                      value,
                      label,
                    });
                  },
                },
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
        <input
          type="text"
          placeholder="Nueva contraseña"
          name="password"
          onChange={(e) => {
            setFormData({
              ...formData,
              contraseña: e.target.value,
            });
          }}
          value={formData.contraseña}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="text-blue-500 bg-blue-200 font-semibold rounded-lg py-2 px-4"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4">
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
  usuario,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [selectedRole, setSelectedRole] = useState<Selected>({
    value: usuario?.rol,
    label:
      usuario?.rol === "SUPERADMINISTRADOR"
        ? "Superadministrador"
        : usuario?.rol === "ADMINISTRADOR"
        ? "Administrador"
        : "Empleado",
  });
  const [formData, setFormData] = useState<Usuario>({
    ...usuario!,
    contraseña: "",
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
      className="w-2/5 h-fit rounded-md shadow-md"
    >
      <div className="bg-[#2096ed] py-4 px-8">
        <h1 className="text-xl font-bold text-white">Editar usuario</h1>
      </div>
      <form
        className="flex flex-col p-8 pt-6 gap-4"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          closeModal();
          const loadingToast = toast.loading("Editando usuario...");
          const cleanedFormData = { ...formData };

          if (formData.contraseña === "") {
            delete cleanedFormData.contraseña;
          }

          UserService.update(usuario?.id!, cleanedFormData).then((data) => {
            toast.dismiss(loadingToast);
            setOperationAsCompleted();
            if (data) {
              toast.success("Usuario editado con exito.");
            } else {
              toast.error("Usuario no pudo ser editado.");
            }
            setOperationAsCompleted();
          });
        }}
      >
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nombre"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombre: e.target.value,
              });
            }}
            value={formData.nombre}
            className="border p-2 rounded outline-none focus:border-[#2096ed]"
          />
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
            className="border p-2 rounded outline-none focus:border-[#2096ed]"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre de usuario*"
            onChange={(e) => {
              setFormData({
                ...formData,
                nombreUsuario: e.target.value,
              });
            }}
            value={formData.nombreUsuario}
            className="border p-2 rounded outline-none focus:border-[#2096ed] w-2/4"
          />
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
                  value: "SUPERADMINISTRADOR",
                  label: "Superadministrador",
                  onClick: (value, label) => {
                    setSelectedRole({
                      value,
                      label,
                    });
                  },
                },
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
        <input
          type="text"
          placeholder="Nueva contraseña"
          name="password"
          onChange={(e) => {
            setFormData({
              ...formData,
              contraseña: e.target.value,
            });
          }}
          value={formData.contraseña}
          className="border p-2 rounded outline-none focus:border-[#2096ed]"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={closeModal}
            className="text-blue-500 bg-blue-200 font-semibold rounded-lg py-2 px-4"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4">
            Guardar
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
      className="w-2/5 h-fit rounded-md shadow-md"
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
            className="text-blue-500 bg-blue-200 font-semibold rounded-lg py-2 px-4"
          >
            Cancelar
          </button>
          <button className="bg-[#2096ed] text-white font-semibold rounded-lg p-2 px-4">
            Continuar
          </button>
        </div>
      </form>
    </dialog>
  );
}

function DataRow({ action, usuario, setOperationAsCompleted }: DataRowProps) {
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
        {usuario?.id}
      </th>
      <td className="px-6 py-4 border border-slate-300">{usuario?.nombre}</td>
      <td className="px-6 py-4 border border-slate-300">{usuario?.apellido}</td>
      <td className="px-6 py-4 border border-slate-300">
        {usuario?.nombreUsuario}
      </td>
      <td className="px-6 py-4 border border-slate-300">{usuario?.rol}</td>
      <td className="px-6 py-4 border border-slate-300">
        {usuario?.último_login
          ? format(usuario?.último_login, "dd/MM/yyyy")
          : "Nunca"}
      </td>
      <td className="px-6 py-3 w-52 border border-slate-300">
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
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 py-1 px-2 rounded-lg"
            >
              Editar usuario
            </button>
            <EditModal
              usuario={usuario}
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
              className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 py-1 px-2 rounded-lg"
            >
              Eliminar usuario
            </button>
            <DeleteModal
              usuario={usuario}
              isOpen={isDeleteOpen}
              closeModal={closeDeleteModal}
              setOperationAsCompleted={setOperationAsCompleted}
            />
          </>
        )}
        {action === "VIEW_PERMISSIONS" && (
          <>
            <button className="font-medium text-[#2096ed] dark:text-blue-500 hover:bg-blue-100 py-1 px-2 rounded-lg">
              Editar permisos
            </button>
          </>
        )}
      </td>
    </tr>
  );
}

function Dropup({ close, selectAction, openAddModal }: DropupProps) {
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
          mt-1
          m-0
          bg-clip-padding
          border
        "
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
      <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
      <li>
        <div
          onClick={() => {
            selectAction("VIEW_PERMISSIONS");
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
          Editar permisos
        </div>
      </li>
      <hr className="my-1 h-0 border border-t-0 border-solid border-neutral-700 opacity-25 dark:border-neutral-200" />
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
          Crear usuario
        </div>
      </li>
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
          Buscar usuario
        </div>
      </li>
    </ul>
  );
}

export default function UsersDataDisplay() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDropup, setIsDropup] = useState(false);
  const [isOperationCompleted, setIsOperationCompleted] = useState(false);
  const [action, setAction] = useState<`${Action}`>("NONE");

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
    UserService.getAll().then((data) => {
      if (data === false) {
        setNotFound(true);
        setLoading(false);
      } else {
        setUsers(data);
        setLoading(false);
      }
      setIsOperationCompleted(false);
    });
  }, [isOperationCompleted]);

  return (
    <>
      <div className="absolute h-full w-full px-8 py-6">
        <nav className="flex justify-between items-center select-none">
          <div className="font-medium text-slate-600">
            Menu <Right className="w-3 h-3 inline fill-slate-600" /> Usuarios
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
        <hr className="border-1 border-slate-200 my-5" />
        {users.length > 0 && loading == false && (
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm font-medium text-slate-600 text-left">
              <thead className="text-xs bg-[#2096ed] uppercase text-white select-none w-full">
                <tr className="border-2 border-[#2096ed]">
                  <th scope="col" className="px-6 py-3 border-slate-300">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 border-slate-300">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 border-slate-300">
                    Apellido
                  </th>
                  <th scope="col" className="px-6 py-3 border-slate-300">
                    Nombre de usuario
                  </th>
                  <th scope="col" className="px-6 py-3 border-slate-300">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 border-slate-300">
                    Último inicio de sesión
                  </th>
                  <th scope="col" className="px-8 py-3 border-slate-300">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  return (
                    <DataRow
                      action={action}
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
        {notFound === true && (
          <div className="grid w-full h-4/5">
            <div className="place-self-center  flex flex-col items-center">
              <Face className="fill-[#2096ed] h-20 w-20" />
              <p className="font-bold text-xl text-center mt-1">
                Ningún usuario encontrado
              </p>
              <p className="font-medium text text-center mt-1">
                Esto puede deberse a un error del servidor, o a que simplemente
                no hay ningún cliente registrado.
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
                  className="inline w-14 h-14 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-[#2096ed]"
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
      {users.length > 0 && loading == false && <Pagination />}
      <Toaster position="bottom-right" reverseOrder={false} />
      <AddModal
        isOpen={isAddOpen}
        setOperationAsCompleted={setAsCompleted}
        closeModal={closeAddModal}
      />
    </>
  );
}
