import mongoose from "mongoose"
import { Resena } from "../models/resena.js"

function idValido(id) {
    return mongoose.isValidObjectId(id)
}

export async function buscarPorPelicula(peliculaId) {
    if (!idValido(peliculaId)) {
        return []
    }

    return await Resena.find({ pelicula: peliculaId }).sort({ fechaDeCreacion: -1 })
}

export async function buscarPorUsuario(usuarioId) {
    if (!idValido(usuarioId)) {
        return []
    }
    return await Resena.find({ usuario: usuarioId }).sort({ fechaDeCreacion: -1 })
}

export async function buscarPorId(id) {
    if (!idValido(id)) {
        return null
    }
    return await Resena.findById(id)
}

export async function guardar(datos) {
    const nueva = new Resena(datos)
    return await nueva.save()
}

export async function actualizar(id, datos) {
    if (!idValido(id)) {
        return null
    }

    return await Resena.findByIdAndUpdate(id, datos, { new: true })
}

export async function eliminar(id) {
    if (!idValido(id)) {
        return null
    }
    return await Resena.findByIdAndDelete(id)
}
