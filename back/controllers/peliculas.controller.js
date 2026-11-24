import { listarPeliculas, obtenerPelicula } from "../services/peliculas.service.js"


export async function listar(req, res) {
    try {
        const peliculas = await listarPeliculas()
        res.json(peliculas)
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}

export async function obtener(req, res) {
    try {
        const pelicula = await obtenerPelicula(req.params.id)
        res.json(pelicula)
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message })
    }
}
