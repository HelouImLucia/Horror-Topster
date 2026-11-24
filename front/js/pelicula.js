import {leerToken, leerUsuario, obtenerPelicula, obtenerMiTop, agregarAlTop, quitarDelTop, obtenerResenas, publicarResena, editarResena, borrarResena} from "./api.js"
import { crearElemento, crearPoster, mostrarAviso, crearEsqueleto } from "./comunes.js"
import { abrirModal, activarCerrarSesion } from "./modal.js"
import { iniciales, haceCuanto, ordenarResenas, activarFiltro, pintarResenasEsqueleto, crearAccionesResena, confirmarBorrado
} from "./resenas.js"


const articuloFicha = document.querySelector(".ficha")
const h1Titulo = document.querySelector("#fichaTitulo")
const divPoster = document.querySelector("#fichaPoster")
const spanAnio = document.querySelector("#fichaAnio")
const spanDuracion = document.querySelector("#fichaDuracion")
const spanTipo = document.querySelector("#fichaTipo")
const h2Frase = document.querySelector("#fichaFrase")
const pDescripcion = document.querySelector("#fichaDescripcion")
const ddDireccion = document.querySelector("#fichaDireccion")
const ddGuion = document.querySelector("#fichaGuion")
const ddReparto = document.querySelector("#fichaReparto")
const btnTop = document.querySelector("#btnTop")


const formResena = document.querySelector("#formResena")
const h3TituloForm = document.querySelector("#tituloFormResena")
const txtResena = document.querySelector("#textoResena")
const spanContador = document.querySelector("#contadorResena")
const selPuntaje = document.querySelector("#puntajeResena")
const btnCancelarResena = document.querySelector("#btnCancelarResena")
const btnPublicar = document.querySelector("#btnPublicar")
const pEstadoResenas = document.querySelector("#estadoResenas")
const listaResenas = document.querySelector("#listaResenas")

const MAXIMO = 10

const idPelicula = new URLSearchParams(window.location.search).get("id")


const usuario = leerUsuario()
const miId = usuario ? usuario._id : null

let pelicula = null
let miTop = []
let resenas = []
let orden = "todas"
let idEditando = null 


function ponerLineas(elemento, anchos) {
    elemento.innerHTML = ""
    anchos.forEach((ancho) => {
        elemento.appendChild(crearEsqueleto("esqueleto-linea", ancho))
    })
}

function pintarFichaEsqueleto() {

    articuloFicha.classList.add("cargando")
    articuloFicha.setAttribute("aria-busy", "true")

    divPoster.innerHTML = ""
    divPoster.appendChild(crearEsqueleto("esqueleto-poster"))

    ponerLineas(h1Titulo, ["55%"])
    ponerLineas(spanAnio, ["3rem"])
    ponerLineas(spanDuracion, ["4.5rem"])
    ponerLineas(h2Frase, ["80%"])
    ponerLineas(pDescripcion, ["100%", "100%", "95%", "60%"])
    ponerLineas(ddDireccion, ["70%"])
    ponerLineas(ddGuion, ["60%"])
    ponerLineas(ddReparto, ["100%", "75%"])
}

function quitarFichaEsqueleto() {
    articuloFicha.classList.remove("cargando")
    articuloFicha.removeAttribute("aria-busy")
    const elementos = [divPoster, spanAnio, spanDuracion, h2Frase, pDescripcion, ddDireccion, ddGuion, ddReparto]
    elementos.forEach((elemento) => {
        elemento.innerHTML = ""
    })
}


function pintarFicha() {

    articuloFicha.classList.remove("cargando")
    articuloFicha.removeAttribute("aria-busy")
    document.title = pelicula.nombre + " · Horror Topster"
    h1Titulo.textContent = pelicula.nombre

    divPoster.innerHTML = ""
    divPoster.appendChild(crearPoster(pelicula))

    spanAnio.textContent = pelicula.anio
    spanDuracion.textContent = pelicula.duracion + " min"
    spanTipo.textContent = pelicula.tipo
    h2Frase.textContent = pelicula.frase
    pDescripcion.textContent = pelicula.descripcion

    ddDireccion.textContent = pelicula.direccion
    ddGuion.textContent = pelicula.guion
    ddReparto.textContent = pelicula.cast.join(", ")
}


function itemDeEstaPelicula() {
    return miTop.find((item) => item.pelicula === pelicula._id)
}

function pintarBotonTop() {
    btnTop.disabled = false
    if (itemDeEstaPelicula()) {
        btnTop.textContent = "Añadido a Mi Top 10"
        btnTop.classList.add("agregada")
        btnTop.title = "Tocá para sacarla de tu Top 10"
    } else {
        btnTop.textContent = "Añadir a Mi Top 10"
        btnTop.classList.remove("agregada")
        btnTop.title = ""
    }
}

async function refrescarTop() {
    miTop = await obtenerMiTop()
    pintarBotonTop()
}

async function quitar(item) {
    try {
        await quitarDelTop(item._id)
        await refrescarTop()
        mostrarAviso(pelicula.nombre + " salió de tu Top 10.")
    } catch (error) {
        mostrarAviso(error.message)
    }
}

btnTop.addEventListener("click", async () => {
    const item = itemDeEstaPelicula()


    if (item) {
        abrirModal({
            titulo: "¿Sacarla del Top?",
            texto: pelicula.nombre + " va a dejar su puesto en tu Top 10.",
            textoCancelar: "Cancelar",
            textoAceptar: "Quitar",
            alAceptar: () => {
                quitar(item)
            }
        })
        return
    }

    if (miTop.length >= MAXIMO) {
        abrirModal({
            titulo: "Oh, no, no, no...",
            texto: "Debes eliminar películas de tu Topster si quieres seguir agregando nuevas."
        })
        return
    }

    btnTop.disabled = true
    try {
        await agregarAlTop(pelicula._id)
        await refrescarTop()
        mostrarAviso(pelicula.nombre + " entró a tu Top 10.")
    } catch (error) {
        mostrarAviso(error.message)
        btnTop.disabled = false
    }
})


function pintarResenas() {
    listaResenas.innerHTML = ""

    if (resenas.length === 0) {
        pEstadoResenas.textContent = "Todavía no hay reseñas de esta película. ¡Animate a ser la primera voz del archivo!"
        return
    }
    pEstadoResenas.textContent = ""

    ordenarResenas(resenas, orden).forEach((resena) => {
        const esMia = resena.usuario === miId
        const li = crearElemento("li", "resena")

        const cabeza = crearElemento("div", "resena-cabeza")

        const avatar = crearElemento("span", "avatar", esMia ? "" : iniciales(resena.nombreUsuario))
        avatar.setAttribute("aria-hidden", "true")
        if (esMia) {
            avatar.classList.add("avatar-propio")
        } else if (resena.nombreUsuario.length % 2 === 0) {
            avatar.classList.add("avatar-claro")   
        }
        cabeza.appendChild(avatar)

        const quien = crearElemento("div", "")
        quien.appendChild(crearElemento("strong", "resena-autor", esMia ? "Tú" : resena.nombreUsuario))
        quien.appendChild(crearElemento("span", "resena-fecha", haceCuanto(resena.fechaDeCreacion)))
        cabeza.appendChild(quien)

        if (esMia) {
            cabeza.appendChild(crearAccionesResena(
                resena,
                () => empezarEdicion(resena),
                () => confirmarBorrado(() => eliminar(resena))
            ))
        }
        li.appendChild(cabeza)


        li.appendChild(crearElemento("p", "resena-puntaje", resena.puntaje + "/5"))
        li.appendChild(crearElemento("p", "resena-texto", resena.texto))

        listaResenas.appendChild(li)
    })
}

async function refrescarResenas() {
    try {
        resenas = await obtenerResenas(pelicula._id)
        pintarResenas()
    } catch (error) {
        listaResenas.innerHTML = ""
        pEstadoResenas.textContent = "No pudimos cargar las reseñas: " + error.message
    }
}


function actualizarContador() {
    spanContador.textContent = txtResena.value.length + "/500"
}

function empezarEdicion(resena) {
    idEditando = resena._id
    txtResena.value = resena.texto
    selPuntaje.value = String(resena.puntaje)
    actualizarContador()
    h3TituloForm.textContent = "Editando tu reseña"
    btnPublicar.textContent = "Guardar cambios"
    btnCancelarResena.style.display = ""
    txtResena.focus()   
}

function limpiarFormulario() {
    idEditando = null
    txtResena.value = ""
    selPuntaje.value = "5"
    actualizarContador()
    h3TituloForm.textContent = "Comparte una terrorífica reseña con los demás."
    btnPublicar.textContent = "Publicar reseña"
    btnCancelarResena.style.display = "none"
}

txtResena.addEventListener("input", actualizarContador)
btnCancelarResena.addEventListener("click", limpiarFormulario)


formResena.addEventListener("submit", async (evento) => {
    evento.preventDefault()

    const texto = txtResena.value.trim()
    const puntaje = Number(selPuntaje.value)

    if (texto === "") {
        mostrarAviso("Escribí algo antes de publicar.")
        txtResena.focus()
        return
    }

    btnPublicar.disabled = true
    try {
        if (idEditando === null) {
            await publicarResena(pelicula._id, texto, puntaje)
            mostrarAviso("¡Reseña publicada!")
        } else {
            await editarResena(idEditando, texto, puntaje)
            mostrarAviso("Guardamos los cambios de tu reseña.")
        }
        limpiarFormulario()
        await refrescarResenas()
    } catch (error) {
        mostrarAviso(error.message)
    }
    btnPublicar.disabled = false
})


async function eliminar(resena) {
    try {
        await borrarResena(resena._id)
   
        if (idEditando === resena._id) {
            limpiarFormulario()
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


async function iniciar() {
    activarCerrarSesion()


    if (!idPelicula) {
        window.location.href = "index.html#archivo"
        return
    }

    pintarFichaEsqueleto()
    pintarResenasEsqueleto(listaResenas, pEstadoResenas)

    try {
        pelicula = await obtenerPelicula(idPelicula)
        miTop = await obtenerMiTop()
    } catch (error) {
        quitarFichaEsqueleto()
        h1Titulo.textContent = "Película no encontrada"
        listaResenas.innerHTML = ""
        pEstadoResenas.textContent = ""
        mostrarAviso(error.message)
        return
    }

    pintarFicha()
    pintarBotonTop()
    await refrescarResenas()
}

if (!leerToken()) {
    window.location.href = "login.html"
} else {
    iniciar()
}
