import { buscarTodas, buscarPorId } from "../repositories/peliculas.repository.js"
import { errorCon } from "./errores.js"


export async function listarPeliculas() {
    return await buscarTodas()
}

export async function obtenerPelicula(id) {
    const pelicula = await buscarPorId(id)
    if (!pelicula) {
        throw errorCon(404, "No existe una película con id " + id)
    }
    return pelicula
}

