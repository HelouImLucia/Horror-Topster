export const BASE_URL = "https://horror-topster.onrender.com/"


export function guardarSesion(token, usuario, recordar) {
    const almacen = recordar ? localStorage : sessionStorage
    almacen.setItem("token", token)
    almacen.setItem("usuario", JSON.stringify(usuario))
}

export function leerToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token")
}

export function leerUsuario() {
    const texto = localStorage.getItem("usuario") || sessionStorage.getItem("usuario")
    if (!texto) {
        return null
    }
    return JSON.parse(texto)
}

export function borrarSesion() {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("usuario")
}
function armarHeaders() {
    const headers = { "Content-Type": "application/json" }
    const token = leerToken()
    if (token) {
        headers.Authorization = "Bearer " + token
    }
    return headers
}

async function pedir(metodo, ruta, cuerpo) {
    const opciones = {
        method: metodo,
        headers: armarHeaders()
    }
    if (cuerpo) {
        opciones.body = JSON.stringify(cuerpo)
    }

    let respuesta
    try {
        respuesta = await fetch(BASE_URL + ruta, opciones)
    } catch (error) {
        throw new Error("No pudimos conectar con el servidor. ¿Está prendido?")
    }

    let datos
    try {
        datos = await respuesta.json()
    } catch (error) {
        throw new Error("El servidor no respondió JSON en " + ruta + ". ¿Existe esa ruta en backend?")
    }

    if (respuesta.status === 401 && leerToken()) {
        borrarSesion()
        window.location.href = "login.html"
    }

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || "Algo salió mal (error " + respuesta.status + ")")
    }
    return datos
}


export async function registrarUsuario(nombre, email, password) {
    return await pedir("POST", "/usuarios/registro", { nombre: nombre, email: email, password: password })
}

export async function iniciarSesion(email, password) {
    return await pedir("POST", "/usuarios/login", { email: email, password: password })
}


export async function obtenerPeliculas() {
    return await pedir("GET", "/peliculas")
}

export async function obtenerPelicula(id) {
    return await pedir("GET", "/peliculas/" + id)
}


export async function obtenerMiTop() {
    return await pedir("GET", "/top")
}

export async function agregarAlTop(idPelicula) {
    return await pedir("POST", "/top", { pelicula: idPelicula })
}

export async function quitarDelTop(idItem) {
    return await pedir("DELETE", "/top/" + idItem)
}

export async function ordenarTop(ids) {
    return await pedir("PUT", "/top/orden", { orden: ids })
}


export async function obtenerResenas(idPelicula) {
    return await pedir("GET", "/resenas?pelicula=" + idPelicula)
}

export async function obtenerMisResenas() {
    return await pedir("GET", "/resenas/mias")
}

export async function publicarResena(idPelicula, texto, puntaje) {
    return await pedir("POST", "/resenas", { pelicula: idPelicula, texto: texto, puntaje: puntaje })
}

export async function editarResena(id, texto, puntaje) {
    return await pedir("PUT", "/resenas/" + id, { texto: texto, puntaje: puntaje })
}

export async function borrarResena(id) {
    return await pedir("DELETE", "/resenas/" + id)
}
