export type ModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  setOperationAsCompleted: () => void;
  cliente?: Cliente;
  usuario?: Usuario;
  producto?: Producto;
  publicación?: Publicación;
  categoría?: Categoría;
  proveedor?: Proveedor;
  elemento?: Elemento;
  ticket?: Ticket;
  problema?: Problema;
  mensaje?: Mensaje;
  servicio?: Servicio;
  operación?: Operación;
  venta?: Venta;
  compra?: Compra;
};

export type SectionProps = {
  isOpen: boolean;
  close: () => void;
  setOperationAsCompleted: () => void;
  onClick?: () => void;
  venta?: Venta;
  compra?: Compra;
  publicación?: Publicación;
  action?: Action;
}

export type EmbeddedTableProps = {
  onChange: (detalles: DetalleVenta[]) => void;
  action?: Action;
}

export type EmbeddedDataRowProps = {
  onChange: (detalle: DetalleVenta) => void;
  producto?: Producto;
  action?: Action;
}

export type DropupProps = {
  selectAction: (action: `${Action}`) => void;
  selectSecondAction?: (action: `${Action}`) => void;
  close: () => void;
  openAddModal: () => void;
  toEdit?: boolean;
  toAdd?: boolean;
};

export type DataRowProps = {
  action: string;
  onClick?: () => void;
  setOperationAsCompleted: () => void;
  cliente?: Cliente;
  usuario?: Usuario;
  producto?: Producto;
  publicación?: Publicación;
  categoría?: Categoría;
  proveedor?: Proveedor;
  elemento?: Elemento;
  ticket?: Ticket;
  problema?: Problema;
  mensaje?: Mensaje;
  servicio?: Servicio;
  operación?: Operación;
  venta?: Venta;
  compra?: Compra;
};

export type OptionProps = {
  value: string | number | undefined;
  label: string | undefined;
  onClick: (
    value: string | number | undefined,
    label: string | undefined
  ) => void;
  closeOnClick?: () => void;
};

export type OptionGroupProps = {
  options: OptionProps[];
  close: () => void;
  closeOnOptionClick: () => void;
};

export type SelectProps = {
  selected: Selected;
  options: OptionProps[];
  onChange?: () => void;
  disable?: boolean;
};

export type Selected = {
  value: string | number | undefined;
  label: string | undefined;
};


export type LogicalOperator = "Y" | "O";

export type ComparisonOperator = "ES IGUAL QUE" | "NO ES IGUAL QUE";

export type TypeOperator = "SI" | "SINO" | "SINO PERO" | "DEFAULT" | "FIN";

export type Operation = {
  leftSideValue: string | number | undefined;
  rightSideValue: string | number | undefined;
  comparisonOperator: ComparisonOperator;
  logicalOperator?: LogicalOperator;
};

export type Result = {
  isTrue: boolean;
  logicalOperator?: LogicalOperator;
};

export type CommandBlock = {
  type: TypeOperator;
  command: string;
  template: string;
  operations?: Operation[];
  results?: Result[];
  isTrue?: boolean;
};

export type Previamente = {
  ticket?: Ticket;
  problema?: Problema;
  servicio?: Servicio;
  operación?: Operación;
};

export interface Options {
  usuario?: Usuario;
  cliente?: Cliente;
  elemento?: Elemento;
  ticket?: Ticket;
  problema?: Problema;
  servicio?: Servicio;
  operación?: Operación;
  previamente?: Previamente;
}

export type Action =
  | "NONE"
  | "EDIT"
  | "DELETE"
  | "VIEW_ELEMENTS"
  | "VIEW_SERVICES"
  | "VIEW_PROBLEMS"
  | "VIEW_MESSAGES"
  | "VIEW_PERMISSIONS"
  | "VIEW_OPERATIONS"
  | "VIEW_ASSOCIATED_PRODUCTOS"
  | "VIEW_AS_PDF"
  | "CONFIRM_ORDER"
  | "PREVIEW"
  | "RESOLVE_PROBLEM"
  | "QUERY_BY"
  | "ADD"
  | "REDUCE"

export type UsuarioRol = "EMPLEADO" | "ADMINISTRADOR" | "SUPERADMINISTRADOR";

export type ElementoEstado = "ACTIVO" | "INACTIVO";

export type TicketEstado = "ABIERTO" | "CERRADO";

export type TicketTipo = "DOMICILIO" | "TIENDA" | "REMOTO";

export type ServicioEstado = "PENDIENTE" | "INICIADO" | "COMPLETADO";

export type ProblemaEstado = "PENDIENTE" | "RESUELTO";

export type ProblemaPrioridad = "BAJA" | "MEDIA" | "ALTA";

export type MensajeEstado = "NO_ENVIADO" | "ENVIADO";

export type OperaciónEstado = "PENDIENTE" | "INICIADA" | "COMPLETADA";

export type CategoríaTipo = "ELEMENTO" | "PRODUCTO" | "SERVICIO";

export type CompraEstado = "PENDIENTE" | "CONFIRMADA";

export type PlantillaEsDe = "TICKET" | "PROBLEMA" | "SERVICIO" |  "OPERACIÓN";

export type PlantillaEvento = "CREACIÓN" |"MODIFICACIÓN" | "ELIMINACIÓN" | "ASOCIACIÓN";

export type Opciones = {
  creación: {
    nunca: boolean;
    siempre: boolean;
    mostrarAntes: boolean;
  };
  envio: {
    nunca: boolean;
    siempre: boolean;
    preguntarAntes: boolean;
  };
};

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  contraseña?: string;
  rol: UsuarioRol;
  último_login?: Date;
}

export type Permiso = {
  cliente: boolean;
  ticket: boolean;
  elemento: boolean;
  problema: boolean;
  mensaje: boolean;
  servicio: boolean;
  operación: boolean;
  categoría: boolean;
  imagen: boolean;
  venta: boolean;
  compra: boolean;
  publicación: boolean;
  proveedor: boolean;
};

export interface Permisos {
  id?: number;
  ver: Permiso;
  crear: Permiso;
  editar: Permiso;
  eliminar: Permiso;
  usuario_id?: number;
}

export interface Cliente {
  id?: number;
  nombre: string;
  apellido: string;
  cédula?: string;
  email?: string;
  telefono?: string;
  dirección?: string;
  enviarMensajes?: boolean;
  contraseña?: string;
}

export interface Elemento {
  id?: number;
  nombre: string;
  descripción?: string;
  estado: ElementoEstado;
  readonly registrado?: Date;
  cliente_id?: number;
  categoría_id?: number;
  categoría?: Categoría;
  cliente?: Cliente;
}

export interface Ticket {
  id?: number;
  estado: TicketEstado;
  tipo: TicketTipo;
  readonly creado?: Date;
  elemento_id?: number;
  elemento?: Elemento;
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripción?: string;
  estado: ServicioEstado;
  readonly añadido?: Date;
  completado?: Date;
  ticket_id?: number;
  categoría_id?: number;
  categoría?: Categoría;
}

export interface Problema {
  id?: number;
  nombre: string;
  descripción?: string;
  causa?: string;
  solución?: string;
  prioridad: ProblemaPrioridad;
  estado: ProblemaEstado;
  readonly detectado?: Date;
  ticket_id?: number;
}

export interface Mensaje {
  id?: number;
  contenido: string;
  estado: MensajeEstado;
  readonly creado?: Date;
  modificado?: Date;
  ticket_id?: number;
}

export interface Operación {
  id?: number;
  nombre: string;
  descripción?: string;
  resultado?: string;
  estado: OperaciónEstado;
  readonly añadida?: Date;
  completada?: Date;
  servicio_id?: number;
}

export interface Categoría {
  id?: number;
  nombre: string;
  descripción?: string;
  tipo: `${CategoríaTipo}`;
}

export interface Producto {
  id?: number;
  slug: string;
  nombre: string;
  descripción?: string;
  precio: number;
  stock: number;
  esPúblico: boolean;
  categoría_id?: number;
  categoría?: Categoría;
}

export interface Publicación {
  id?: number;
  slug: string;
  título: string;
  contenido: string;
  esPública: boolean;
  creada?: Date;
  modificada?: Date;
  imagen_id?: number;
  usuario_id?: number;
}

export interface OperaciónProducto {
  operación_id?: number;
  producto_id?: number;
}

export interface Proveedor {
  id?: number;
  nombre: string;
  descripción?: string;
  telefono?: string;
}

export interface Venta {
  id?: number;
  fecha?: Date;
  impuesto: number;
  subtotal: number;
  total: number;
  cliente_id?: number;
  cliente?: Cliente;
  detalles?: DetalleVenta[]
}

export interface Compra {
  id?: number;
  fecha?: Date;
  estado: CompraEstado;
  impuesto: number;
  subtotal: number;
  total: number;
  proveedor_id: number;
  proveedor?: Proveedor;
  detalles?: DetalleCompra[]
}

export interface DetalleVenta {
  venta_id?: number;
  producto_id?: number;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  producto?: Producto;
}

export interface DetalleCompra {
  compra_id?: number;
  producto_id?: number;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  producto?: Producto;
}

export interface Imagen {
  id?: number;
  url: string;
  descripción?: string;
  esPública: boolean;
}

export interface ImagenProducto {
  imagen_id?: number;
  producto_id?: number;
}

export interface Plantilla {
  id: number;
  contenido: string;
  esDe: PlantillaEsDe;
  evento: PlantillaEvento;
  estaActiva: boolean;
  mensajería_id?: number;
}

export interface Mensajería {
  id: number;
  opciones: Opciones;
  }
