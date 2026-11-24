import {leerToken, obtenerPeliculas, obtenerMisResenas, editarResena, borrarResena} from "./api.js"
import { crearElemento, crearPoster, mostrarAviso } from "./comunes.js"
import { activarCerrarSesion } from "./modal.js"
import {haceCuanto, ordenarResenas, activarFiltro, pintarResenasEsqueleto, crearAccionesResena, confirmarBorrado} from "./resenas.js"

const inpBuscar = document.querySelector("#buscarMisResenas")
const pTotal = document.querySelector("#totalResenas")
const pEstadoResenas = document.querySelector("#estadoResenas")
const listaResenas = document.querySelector("#listaResenas")

let peliculas = []
let resenas = []
let orden = "todas"
let cargando = true

let idEditando = null
let borrador = { texto: "", puntaje: 5 }


function buscarPelicula(id) {
    return peliculas.find((p) => p._id === id)
}

function filtrarResenas(texto) {
    const buscado = texto.trim().toLowerCase()
    return resenas.filter((resena) => {
        const pelicula = buscarPelicula(resena.pelicula)
        if (!pelicula) {
            return buscado === ""
        }
        return pelicula.nombre.toLowerCase().includes(buscado) || String(pelicula.anio).includes(buscado)
    })
}


function crearNota(puntaje) {
    const nota = crearElemento("p", "resena-nota")
    nota.title = "Tu puntaje"

    nota.appendChild(crearElemento("span", "visualmente-oculto", "Tu puntaje: "))
    nota.appendChild(crearElemento("strong", "resena-nota-numero", puntaje))
    nota.appendChild(crearElemento("span", "resena-nota-de", " / 5"))
    return nota
}


function crearFormEdicion(resena) {
    const form = crearElemento("form", "resena-edicion")

    const idTexto = "editar-" + resena._id
    const label = crearElemento("label", "visualmente-oculto", "Tu reseña")
    label.htmlFor = idTexto
    form.appendChild(label)

    const txt = document.createElement("textarea")
    txt.id = idTexto
    txt.maxLength = 500
    txt.value = borrador.texto
    form.appendChild(txt)

    const pie = crearElemento("div", "resena-form-pie")
    const contador = crearElemento("span", "resena-contador", txt.value.length + "/500")
    pie.appendChild(contador)

    const selector = crearElemento("label", "selector-puntaje", "Puntaje")
    const sel = document.createElement("select")
    for (let i = 5; i >= 1; i--) {
        const opcion = crearElemento("option", "", i + "/5")
        opcion.value = String(i)
        sel.appendChild(opcion)
    }
    sel.value = String(borrador.puntaje)
    selector.appendChild(sel)
    pie.appendChild(selector)

    const btnCancelar = crearElemento("button", "boton-pill boton-pill-borde", "Cancelar")
    btnCancelar.type = "button"
    pie.appendChild(btnCancelar)

    const btnGuardar = crearElemento("button", "boton-pill", "Guardar cambios")
    btnGuardar.type = "submit"
    pie.appendChild(btnGuardar)

    form.appendChild(pie)

    txt.addEventListener("input", () => {
        borrador.texto = txt.value
        contador.textContent = txt.value.length + "/500"
    })
    sel.addEventListener("change", () => {
        borrador.puntaje = Number(sel.value)
    })
    btnCancelar.addEventListener("click", () => {
        idEditando = null
        pintarResenas()
    })

    form.addEventListener("submit", async (evento) => {
        evento.preventDefault()

        const texto = txt.value.trim()
        if (texto === "") {
            mostrarAviso("Escribí algo antes de guardar.")
            txt.focus()
            return
        }

        btnGuardar.disabled = true
        try {
            await editarResena(resena._id, texto, Number(sel.value))
            idEditando = null
            await refrescarResenas()
            mostrarAviso("Guardamos los cambios de tu reseña.")
        } catch (error) {
            mostrarAviso(error.message)
            btnGuardar.disabled = false
        }
    })

    return form
}


function crearTarjeta(resena) {
    const pelicula = buscarPelicula(resena.pelicula)
    const editando = resena._id === idEditando

    const li = crearElemento("li", "resena resena-mia")
    if (editando) {
        li.classList.add("editando")
    }

    const enlacePoster = crearElemento("a", "resena-mia-poster")
    if (pelicula) {
        enlacePoster.href = "pelicula.html?id=" + pelicula._id
        enlacePoster.setAttribute("aria-label", "Ir a " + pelicula.nombre)
        enlacePoster.appendChild(crearPoster(pelicula))
    } else {
        enlacePoster.appendChild(crearPoster({ nombre: "?", anio: "" }))
    }
    li.appendChild(enlacePoster)

    const cuerpo = crearElemento("div", "resena-mia-cuerpo")

    const cabeza = crearElemento("div", "resena-mia-cabeza")
    const titulo = crearElemento("h3", "resena-pelicula", pelicula ? pelicula.nombre : "Película no disponible")
    cabeza.appendChild(titulo)
    if (!editando) {
        cabeza.appendChild(crearNota(resena.puntaje))
    }
    cuerpo.appendChild(cabeza)

    cuerpo.appendChild(crearElemento("p", "resena-fecha", haceCuanto(resena.fechaDeCreacion)))

    if (editando) {
        cuerpo.appendChild(crearFormEdicion(resena))
    } else {
        cuerpo.appendChild(crearElemento("p", "resena-texto", resena.texto))

        const acciones = crearAccionesResena(
            resena,
            () => empezarEdicion(resena),
            () => confirmarBorrado(() => eliminar(resena))
        )
        if (pelicula) {
            const verPelicula = crearElemento("a", "boton-mini", "Ver película")
            verPelicula.href = "pelicula.html?id=" + pelicula._id
            acciones.prepend(verPelicula)
        }
        cuerpo.appendChild(acciones)
    }

    li.appendChild(cuerpo)
    return li
}


function pintarResenas() {
    if (cargando) {
        return
    }
    listaResenas.innerHTML = ""

    if (resenas.length === 0) {
        pTotal.textContent = ""
        pEstadoResenas.textContent = "Todavía no escribiste ninguna reseña. Entrá a una película del Archivo del Terror y contá qué te pareció."
        return
    }

    pTotal.textContent = "Escribiste " + resenas.length + (resenas.length === 1 ? " reseña" : " reseñas")

    const encontradas = filtrarResenas(inpBuscar.value)
    if (encontradas.length === 0) {
        pEstadoResenas.textContent = "Ninguna de tus reseñas coincide con esa búsqueda."
        return
    }
    pEstadoResenas.textContent = ""

    ordenarResenas(encontradas, orden).forEach((resena) => {
        listaResenas.appendChild(crearTarjeta(resena))
    })

    const txtEditando = listaResenas.querySelector(".editando textarea")
    if (txtEditando && document.activeElement !== inpBuscar) {
        txtEditando.focus()
    }
}

async function refrescarResenas() {
    try {
        resenas = await obtenerMisResenas()
        pintarResenas()
    } catch (error) {
        listaResenas.innerHTML = ""
        pEstadoResenas.textContent = "No pudimos cargar tus reseñas: " + error.message
    }
}


function empezarEdicion(resena) {
    idEditando = resena._id
    borrador = { texto: resena.texto, puntaje: resena.puntaje }
    pintarResenas()
}


async function eliminar(resena) {
    try {
        await borrarResena(resena._id)
        if (idEditando === resena._id) {
            idEditando = null
        }
        await refrescarResenas()
        mostrarAviso("Tu reseña se borró.")
    } catch (error) {
        mostrarAviso(error.message)
    }
}


activarFiltro((nuevoOrden) => {
    orden = nuevoOrden
    pintarResenas()
})

inpBuscar.addEventListener("input", pintarResenas)


async function iniciar() {
    activarCerrarSesion()
    pintarResenasEsqueleto(listaResenas, pEstadoResenas)

    try {
        peliculas = await obtenerPeliculas()
        resenas = await obtenerMisResenas()
    } catch (error) {
        listaResenas.innerHTML = ""
        pEstadoResenas.textContent = "No pudimos cargar tus reseñas: " + error.message
        return
    }
    cargando = false
    pintarResenas()
}

if (!leerToken()) {
    window.location.href = "login.html"
} else {
    iniciar()
}
