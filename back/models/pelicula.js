import mongoose from "mongoose"


const peliculaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    duracion: { type: Number, required: true},
    anio: { type: Number, required: true },
    tipo: { type: String, required: true },
    frase: { type: String },
    direccion: { type: String },
    guion: { type: String },
    cast: [String],           
    imagen: { type: String }
})

export const Pelicula = mongoose.model("Pelicula", peliculaSchema, "Peliculas")
