export function convertirIdA8Digitos(id: number) {
  // Convertir el número a una cadena y rellenar con ceros hasta que tenga 8 caracteres
  return id.toString().padStart(8, "0");
}

export function convertirIdA4Digitos(id: number) {
  // Convertir el número a una cadena y rellenar con ceros hasta que tenga 8 caracteres
  return id.toString().padStart(6, "0");
}

export function createRowNumber(page: number, size: number, index: number){
  if(page === 1){
    return index;
  } else if (page === 2){
    return index + size
  } else {
    return (page - 1) * size + index;
  }
}
