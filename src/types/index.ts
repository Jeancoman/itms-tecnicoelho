export type ModalProps = {
  isOpen: boolean;
  close: () => void;
};

export type DropupProps = {
  selectAction: (action: `${Action}`) => void;
  close: () => void;
  openAddModal: () => void;
};

export type DataRow = {
  action: string;
  cliente?: Cliente;
  usuario?: Usuario;
};

export enum Action {
  NONE = "NONE",
  EDIT = "EDIT",
  DELETE = "DELETE",
  VIEW_SERVICES = "VIEW_SERVICES",
  VIEW_PROBLEMS = "VIEW_PROBLEMS",
  VIEW_MESSAGES = "VIEW_MESSAGES",
  VIEW_PERMISSIONS = "VIEW_PERMISSIONS",
  VIEW_AS_PDF = "VIEW_AS_PDF",
  CONFIRM_ORDER = "CONFIRM_ORDER",
  PREVIEW = "PREVIEW",
  QUERY_BY = "QUERY_BY"
}

enum UsuarioRol {
  EMPLEADO = "EMPLEADO",
  ADMINISTRADOR = "ADMINISTRADOR",
}

enum ElementoEstado {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
}

enum TicketEstado {
  ABIERTO = "ABIERTO",
  CERRADO = "CERRADO",
}

enum TicketTipo {
  DOMICILIO = "DOMICILIO",
  TIENDA = "TIENDA",
  REMOTO = "REMOTO",
}

enum ServicioEstado {
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADO = "COMPLETADO",
}

enum ProblemaEstado {
  NO_RESUELTO = "NO_RESUELTO",
  RESUELTO = "RESUELTO",
}

enum ProblemaPrioridad {
  BAJO = "BAJO",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
}

enum MensajeEstado {
  NO_ENVIADO = "NO_ENVIADO",
  ENVIADO = "ENVIADO",
}

enum OperaciónEstado {
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADA = "COMPLETADA",
}

enum CategoríaTipo {
  ELEMENTO = "ELEMENTO",
  PRODUCTO = "PRODUCTO",
  SERVICIO = "SERVICIO",
}

enum CompraEstado {
  PENDIENTE = "PENDIENTE",
  COMFIRMADA = "CONFIRMADA",
}

enum ImagenPara {
  GALERÍA = "GALERÍA",
  PRODUCTO = "PRODUCTO",
  PUBLICACIÓN = "PUBLICACIÓN",
}

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  contraseña?: string;
  rol: UsuarioRol;
}

export interface Permiso {
  id?: number;
  nombre: string;
}

export interface PermisoUsuario {
  usuario_id?: number;
  permiso_id?: number;
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
  readonly registrado: Date;
  cliente_id?: number;
  categoría_id?: number;
}

export interface Ticket {
  id?: number;
  estado: TicketEstado;
  tipo: TicketTipo;
  readonly creado?: DataViewConstructor;
  elemento_id?: number;
}

export interface Servicio {
  id?: number;
  nombre: string;
  descripción?: string;
  estado: ServicioEstado;
  readonly añadido: Date;
  completado?: Date;
  ticket_id?: number;
  categoría_id?: number;
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
  tipo: CategoríaTipo;
}

export interface Producto {
  id?: number;
  slug: string;
  nombre: string;
  descripción?: string;
  precio: number;
  stock: number;
  esPublico: boolean;
}

export interface Publicación {
  id?: number;
  slug: string;
  título: string;
  contenido: string;
  esPublica: boolean;
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
  fecha: Date;
  número: string;
  impuesto: number;
  subtotal: number;
  total: number;
}

export interface Compra {
  id?: number;
  fecha: Date;
  estado: CompraEstado;
  impuesto: number;
  subtotal: number;
  total: number;
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
  para: ImagenPara;
}

export interface ImagenProducto {
  imagen_id?: number;
  producto_id?: number;
}
