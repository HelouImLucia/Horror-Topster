import mongoose from "mongoose"
import { Top } from "../models/top.js"


function idValido(id) {
    return mongoose.isValidObjectId(id)
}


export async function buscarDelUsuario(usuarioId) {
    return await Top.find({ usuario: usuarioId })
        .sort({ posicion: 1, fechaDeCreacion: 1 })
}


export async function cambiarPosicion(id, posicion) {
    return await Top.findByIdAndUpdate(
        id,
        { posicion: posicion },
        { new: true }
    )
}


export async function buscarRepetida(usuarioId, peliculaId) {
    return await Top.findOne({
        usuario: usuarioId,
        pelicula: peliculaId
    })
}


export async function buscarPorId(id) {
    if (!idValido(id)) {
        return null
    }

    return await Top.findById(id)
}


export async function guardar(datos) {
    const nuevo = new Top(datos)
    return await nuevo.save()
}


export async function eliminar(id) {
    if (!idValido(id)) {
        return null
    }

    return await Top.findByIdAndDelete(id)
}
