export function convertirIdA8Digitos(id: number) {
  // Convertir el número a una cadena y rellenar con ceros hasta que tenga 8 caracteres
  return id.toString().padStart(8, "0");
}

export function convertirIdA4Digitos(id: number) {
  // Convertir el número a una cadena y rellenar con ceros hasta que tenga 8 caracteres
  return id.toString().padStart(4, "0");
}
