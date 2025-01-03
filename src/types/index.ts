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
  venta?: Venta;
  compra?: Compra;
  plantilla?: Plantilla;
  mensajería?: Mensajería;
  imagen?: Imagen;
  imagenes?: Imagen[];
  impuesto?: Impuesto;
  rol?: Rol;
  deuda?: DeudaCliente;
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
  venta?: Venta;
  compra?: Compra;
  plantilla?: Plantilla;
  imagen?: Imagen;
  impuesto?: Impuesto;
  rol?: Rol;
  historico?: HistoricoInventario;
  acceso?: AccesoUsuario;
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
};

export interface Options {
  usuario?: Usuario;
  cliente?: Cliente;
  ticket?: Ticket;
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
  | "SEND"
  | "VIEW";

export type UsuarioRol = string;

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

export type DetalleImpuesto = {
  codigo: string;
  nombre: string;
  porcentaje: number;
  monto: number;
}[];

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  documento: string;
  nombreUsuario: string;
  contraseña?: string;
  creado_por?: {
    lista: number[];
  };
  permiso?: Permisos;
  rol?: Rol;
  rol_id?: number;
}

export interface Rol {
  id?: number;
  nombre: string;
  ver: Permiso;
  crear: Permiso;
  editar: Permiso;
  eliminar: Permiso;
}

export type Permiso = {
  usuario: boolean;
  restauracion: boolean;
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
  rol: boolean;
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
  descripción?: string;
  tipo: ServicioTipo;
  readonly creado?: Date;
  readonly cerrado?: Date;
  cliente_id?: number;
  cliente?: Cliente;
  categoría_id?: number;
  categoría?: Categoría;
}

export interface Mensaje {
  id?: number;
  contenido: string;
  estado: MensajeEstado;
  readonly creado?: Date;
  modificado?: Date;
  servicio_id?: number;
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
  slug: string;
  nombre: string;
  descripción?: string;
  precioCompra: number;
  precioVenta: number;
  exento: boolean;
  existencias: number;
  esPúblico: boolean;
  categoría_id?: number;
  categoría?: Categoría;
  imagens?: Imagen[];
  impuestos?: Impuesto[];
}

export interface Impuesto {
  id?: number;
  codigo?: string;
  nombre: string;
  porcentaje: number;
  aplicaA: "PRODUCTO" | "VENTA";
  condicionPago: "CONTADO" | "CREDITO" | null;
  tipoMoneda: "BOLIVAR" | "DIVISA" | null;
}

export interface Publicación {
  id?: number;
  slug: string;
  título: string;
  portada: string;
  descripcionPortada: string;
  contenido: string;
  esPública: boolean;
  autor?: string;
  readonly creada?: Date;
  modificada?: Date;
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
  subtotal: number;
  total: number;
  anulada?: boolean;
  tipoPago: "CONTADO" | "CREDITO";
  tipoMoneda: "BOLIVAR" | "DIVISA";
  cliente_id?: number;
  cliente?: Cliente;
  detalles?: DetalleVenta[];
  productos?: Producto[];
  deudas?: DeudaCliente[];
  historico_ventum?: HistoricoVenta;
}

export interface Compra {
  id?: number;
  fecha?: Date;
  subtotal: number;
  total: number;
  anulada?: boolean;
  tipoPago: "CONTADO" | "CREDITO";
  tipoMoneda: "BOLIVAR" | "DIVISA";
  emisionFactura?: Date;
  numeroFactura: string;
  proveedor_id: number;
  proveedor?: Proveedor;
  detalles?: DetalleCompra[];
  productos?: Producto[];
  historico_compra?: HistoricoCompra;
}

export interface DeudaCliente {
  id?: number;
  cliente_id?: number;
  venta_id?: number;
  pagada?: boolean;
  deudaPendiente?: number; // Monto de la deuda pendiente
  fechaUltimoPago?: Date; // Fecha del último pago realizado
  fechaVencimiento?: Date; // Fecha de vencimiento de la deuda
}

export interface DetalleVenta {
  venta_id?: number;
  producto_id?: number;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  producto?: Producto;
  impuestos: DetalleImpuesto;
  producto_codigo: string;
  producto_nombre: string;
}

export interface DetalleCompra {
  compra_id?: number;
  producto_id?: number;
  precioUnitario: number;
  producto_codigo: string;
  producto_nombre: string;
  cantidad: number;
  subtotal: number;
  producto?: Producto;
  impuestos: DetalleImpuesto;
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

export type GenericResponse = {
  message: string;
  status: "success" | "error";
};

export type PaginationProps = {
  pages: number;
  current: number;
  next: () => void;
  prev: () => void;
  className?: string;
  customText?: string;
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

export interface AccesoUsuario {
  id: number;
  ip: string;
  dispositivo: string;
  navegador: string;
  sistemaOperativo: string;
  urlSolicitada: string;
  urlReferida: string;
  peticionCuerpo: string;
  peticionEncabezados: string;
  peticionMetodo: string;
  readonly creado?: Date;
  usuario_id?: number;
  usuario?: Usuario;
}

export interface HistoricoInventario {
  id?: number;
  tipoCambio?: string; // Ej: 'ajuste', 'entrada', 'salida'
  motivo?: string; // Motivo común del cambio
  comentarios?: string;
  existenciasAnterior?: number;
  usuarioNombre?: string;
  productoNombre?: string;
  existenciasNuevo?: number;
  readonly fechaCambio?: Date;
  usuario_id?: number; // FK a Usuario
  producto_id?: number;
  producto?: Producto;
  usuario?: Usuario;
}

export interface HistoricoCompra {
  id?: number;
  compra_id: number;
  fecha: Date;
  proveedor_nombre: string;
  proveedor_documento: string;
  impuestos?: impuestoCalculado[];
}

export interface HistoricoVenta {
  id?: number;
  venta_id: number;
  fecha: Date;
  // Datos del cliente
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_documento: string;
  cliente_direccion: string;
  tasa_cambio: number;
  fecha_tasa_cambio: string;
  impuestos?: impuestoCalculado[]
}

export interface FormErrors {
  nombre?: string; // Using optional chaining as 'nombre' may not always be set
  // Add other fields as needed
}

export type Asset = {
  asset_id: string;
  public_id: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string; // ISO 8601 timestamp
  bytes: number;
  asset_folder: string;
  display_name: string;
  url: string;
  secure_url: string;
};

export type impuestoCalculado = {
  impuesto: Impuesto,
  total: number
}

export type ReportType = 
  | "VENDIDO_EN"
  | "COMPRADO_EN"
  | "MAS_VENDIDO"
  | "MAS_COMPRADO"
  | "STOCK_BAJO"
  | "SIN_STOCK";