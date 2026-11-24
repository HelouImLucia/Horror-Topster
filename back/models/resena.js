import mongoose from "mongoose"

const resenaSchema = new mongoose.Schema({
    pelicula: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pelicula",
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    nombreUsuario: { type: String, required: true },
    texto: { type: String, required: true, maxlength: 500 },
    puntaje: { type: Number, required: true, min: 1, max: 5 },
    fechaDeCreacion: { type: Date, default: Date.now }
})

export const Resena = mongoose.model("Resena", resenaSchema)
