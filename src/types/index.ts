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
  mensaje?: Mensaje;
  ticket?: Ticket;
  servicio?: Servicio;
  venta?: Venta;
  compra?: Compra;
  plantilla?: Plantilla;
  mensajería?: Mensajería;
  imagen?: Imagen;
  imagenes?: Imagen[];
  impuesto?: Impuesto;
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
};

export type EmbeddedTableProps = {
  onChange: (detalles: DetalleVenta[]) => void;
  action?: Action;
  searchTerm?: string;
  products?: Producto[];
  page?: number;
  detalles_compra?: DetalleCompra[];
  detalles_venta?: DetalleVenta[];
  setPages?: (pages: number) => void;
  setCurrent?: (current: number) => void;
};

export type EmbeddedDataRowProps = {
  onChange: (detalle: DetalleVenta) => void;
  producto?: Producto;
  detalle_compra?: DetalleCompra;
  detalle_venta?: DetalleVenta;
  action?: Action;
};

export type DropupProps = {
  selectAction: (action: `${Action}`) => void;
  selectSecondAction?: (action: `${Action}`) => void;
  close: () => void;
  openAddModal: () => void;
  openOptionModal?: () => void;
  openSearchModal?: () => void;
  openReportModal?: () => void;
  openImageModal?: () => void;
  openAddModalTwo?: () => void;
  openAddModalThree?: () => void;
  openAddModalFour?: () => void;
  toEdit?: boolean;
  toAdd?: boolean;
  id?: number;
  top?: number;
  left?: number;
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
  mensaje?: Mensaje;
  ticket?: Ticket;
  servicio?: Servicio;
  venta?: Venta;
  compra?: Compra;
  plantilla?: Plantilla;
  imagen?: Imagen;
  impuesto?: Impuesto
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
  selectedValues?: Selected[]; // Las opciones actualmente seleccionadas
  toggleOption?: (value: string | number, label: string) => void; // Función para añadir o eliminar una opción seleccionada
  drop: boolean;
  top: number;
  left: number;
  width: string;
};

export type SelectProps = {
  selected: Selected;
  options: OptionProps[];
  onChange?: () => void;
  disable?: boolean;
  small?: boolean;
};

export type MultiSelectProps = {
  selectedValues: Selected[]; // Cambiado a un array de opciones seleccionadas
  options: OptionProps[]; // Lista de todas las opciones disponibles
  onChange: (selectedValues: Selected[]) => void; // Función para manejar cambios en los valores seleccionados
  disable?: boolean; // Opcional, para deshabilitar el MultiSelect
  small?: boolean; // Opcional, para una versión más compacta del MultiSelect
};

export type Selected = {
  value: string | number | undefined;
  label: string | undefined;
};

export type LogicalOperator = "Y" | "O";

export type ComparisonOperator =
  | "ES IGUAL QUE"
  | "NO ES IGUAL QUE"
  | "HA CAMBIADO A"
  | "HA CAMBIADO ES"
  | "ESTA EN BLANCO ES"
  | "CONTIENE"
  | "EMPIEZA CON"
  | "TERMINA CON";

export type TypeOperator = "SI" | "SINO" | "SINO PERO" | "BASE" | "FIN";

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
  servicio?: Servicio;
};

export interface Options {
  usuario?: Usuario;
  cliente?: Cliente;
  ticket?: Ticket;
  servicio?: Servicio;
  previamente?: Previamente;
  categoría_de_servicio?: Categoría;
}

export type Action =
  | "NONE"
  | "EDIT"
  | "EDIT_RECIBO"
  | "EDIT_ENTREGA"
  | "DELETE"
  | "VIEW_SERVICE"
  | "VIEW_MESSAGES"
  | "VIEW_PERMISSIONS"
  | "VIEW_OPERATIONS"
  | "VIEW_ASSOCIATED_PRODUCTOS"
  | "VIEW_AS_PDF"
  | "CONFIRM_ORDER"
  | "PREVIEW"
  | "RESOLVE_PROBLEM"
  | "QUERY_BY"
  | "VIEW_IMAGES"
  | "ADD"
  | "ADD_ENTREGA"
  | "REDUCE"
  | "SEARCH"
  | "REPORT"
  | "OPTIONS"
  | "MESSAGING"
  | "SEND";

export type UsuarioRol = "EMPLEADO" | "ADMINISTRADOR" | "SUPERADMINISTRADOR";

export type TicketEstado = "ABIERTO" | "CERRADO";

export type ServicioTipo = "DOMICILIO" | "TIENDA" | "REMOTO";

export type ServicioProgreso = "PENDIENTE" | "INICIADO" | "COMPLETADO";

export type TicketPrioridad = "BAJA" | "MEDIA" | "ALTA";

export type MensajeEstado = "NO_ENVIADO" | "ENVIADO";

export type OperaciónEstado = "PENDIENTE" | "INICIADA" | "COMPLETADA";

export type CategoríaTipo = "PRODUCTO" | "SERVICIO";

export type PlantillaEsDe = "SERVICIO" | "TICKET";

export type PlantillaEvento =
  | "CREACIÓN"
  | "MODIFICACIÓN"
  | "ELIMINACIÓN"
  | "ASOCIACIÓN";

export type Opciones = {
  creación: {
    nunca: boolean;
    siempre: boolean;
    preguntar: boolean;
  };
  envio: {
    nunca: boolean;
    siempre: boolean;
    preguntar: boolean;
  };
};

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  documento: string;
  nombreUsuario: string;
  contraseña?: string;
  rol: UsuarioRol;
  creado_por?: {
    lista: number[];
  };
  permiso?: Permisos;
}

export type Permiso = {
  cliente: boolean;
  producto: boolean;
  mensaje: boolean;
  ticket: boolean;
  categoría: boolean;
  imagen: boolean;
  venta: boolean;
  compra: boolean;
  publicación: boolean;
  proveedor: boolean;
  reporte: boolean;
  mensajería: boolean;
  impuesto: boolean;
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
  documento?: string;
  email?: string;
  telefono?: string;
  dirección?: string;
  enviarMensajes?: boolean;
  contraseña?: string;
  readonly registrado?: Date;
}

export interface Ticket {
  id?: number;
  asunto: string;
  prioridad: TicketPrioridad;
  estado: TicketEstado;
  readonly creado?: Date;
  readonly cerrado?: Date;
  cliente_id?: number;
  cliente?: Cliente;
  servicio?: Servicio;
}

export interface Servicio {
  id?: number;
  descripción?: string;
  necesidades?: string;
  tipo: ServicioTipo;
  ticket_id?: number;
  ticket?: Ticket;
  categoría_id?: number;
  categoría?: Categoría;
}

export interface Mensaje {
  id?: number;
  contenido: string;
  estado: MensajeEstado;
  readonly creado?: Date;
  modificado?: Date;
  ticket_id?: number;
}

export interface Categoría {
  id?: number;
  nombre: string;
  descripción?: string;
  tipo: `${CategoríaTipo}`;
  esDigital: boolean;
}

export interface Producto {
  id?: number;
  código?: string;
  marca: string;
  modelo: string;
  slug: string;
  nombre: string;
  descripción?: string;
  precioCompra: number;
  precioVenta: number;
  existencias: number;
  esPúblico: boolean;
  categoría_id?: number;
  categoría?: Categoría;
  imagens?: Imagen[];
}

export interface Impuesto {
  id?: number;
  codigo?: string;
  nombre: string;
  porcentaje: number;
}

export interface Publicación {
  id?: number;
  slug: string;
  título: string;
  contenido: string;
  esPública: boolean;
  readonly creada?: Date;
  modificada?: Date;
  imagen?: Imagen;
  imagen_id?: number;
  usuario_id?: number;
  usuario?: Usuario;
}

export interface Proveedor {
  id?: number;
  nombre: string;
  documento?: string;
  descripción?: string;
  telefono?: string;
  readonly registrado?: Date;
}

export interface Venta {
  id?: number;
  fecha?: Date;
  impuesto: number;
  subtotal: number;
  total: number;
  anulada?: boolean;
  cliente_id?: number;
  cliente?: Cliente;
  detalles?: DetalleVenta[];
  productos?: Producto[];
}

export interface Compra {
  id?: number;
  fecha?: Date;
  impuesto: number;
  subtotal: number;
  total: number;
  anulada?: boolean;
  proveedor_id: number;
  proveedor?: Proveedor;
  detalles?: DetalleCompra[];
  productos?: Producto[];
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
  añadida?: Date;
}

export interface ImagenProducto {
  imagen_id?: number;
  producto_id?: number;
}

export interface Plantilla {
  id?: number;
  contenido: string;
  esDe: PlantillaEsDe;
  evento: PlantillaEvento;
  estaActiva: boolean;
  mensajería_id?: number;
}

export interface Mensajería {
  id?: number;
  opciones: Opciones;
}

export type Response = {
  count: number;
  pages: number;
  current: number;
  rows: any[];
};

export type PaginationProps = {
  pages: number;
  current: number;
  next: () => void;
  prev: () => void;
  className?: string;
};

export interface JwtPayload {
  usuario: Usuario;
  iat: number;
  exp: number;
}

export interface Session {
  usuario: Usuario;
  token: string;
}

export interface FormErrors {
  nombre?: string; // Using optional chaining as 'nombre' may not always be set
  // Add other fields as needed
}
