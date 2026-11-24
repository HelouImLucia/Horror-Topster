export function errorCon(status, mensaje) {
    const error = new Error(mensaje)
    error.status = status
    return error
}
