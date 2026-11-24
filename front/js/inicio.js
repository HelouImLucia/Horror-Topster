import { leerToken, obtenerPeliculas, obtenerMiTop, agregarAlTop, quitarDelTop, ordenarTop } from "./api.js"
import { crearElemento, crearPoster, mostrarAviso, crearEsqueleto, crearGrillaEsqueletos } from "./comunes.js"
import { abrirModal, activarCerrarSesion } from "./modal.js"
import { exportarTopPNG } from "./exportar.js"


const heroSeccion = document.querySelector(".hero")
const listaTickets = document.querySelector("#tickets")
const inpBuscarTop = document.querySelector("#buscarTop")
const divResultados = document.querySelector("#resultadosTop")
const listaTop = document.querySelector("#grillaTop")
const pContador = document.querySelector("#contadorTop")
const inpBuscarArchivo = document.querySelector("#buscarArchivo")
const divArchivo = document.querySelector("#grillaArchivo")
const btnExportar = document.querySelector("#btnExportar")
const btnConfirmar = document.querySelector("#btnConfirmarOrden")
const pEstadoOrden = document.querySelector("#estadoOrden")

const MAXIMO = 10


let peliculas = []  
let miTop = []       
let borrador = []   
let arrastrado = null  
let cargando = true  


function buscarPelicula(id) {
    return peliculas.find((p) => p._id === id)
}

function buscarEnMiTop(idPelicula) {
    return miTop.find((item) => item.pelicula === idPelicula)
}

function filtrarPeliculas(texto) {
    const buscado = texto.trim().toLowerCase()
    return peliculas.filter((p) => {
        return p.nombre.toLowerCase().includes(buscado) || String(p.anio).includes(buscado)
    })
}

function crearVacio(mensaje) {
    const vacio = crearElemento("div", "vacio")
    const fantasma = document.createElement("img")
    fantasma.src = "img/fantasma.svg"
    fantasma.alt = ""
    vacio.appendChild(fantasma)
    vacio.appendChild(crearElemento("p", "", mensaje))
    return vacio
}


function pintarEsqueletos() {
   
    divArchivo.innerHTML = ""
    divArchivo.setAttribute("aria-busy", "true")
    divArchivo.appendChild(crearGrillaEsqueletos("archivo-grilla", 12))


    listaTop.innerHTML = ""
    for (let i = 0; i < MAXIMO; i++) {
        const puesto = crearElemento("li", "puesto")
        puesto.appendChild(crearElemento("span", "puesto-numero", dosCifras(i + 1) + "."))
        puesto.appendChild(crearEsqueleto("esqueleto-poster"))
        puesto.appendChild(crearEsqueleto("esqueleto-barra"))
        listaTop.appendChild(puesto)
    }

    listaTickets.innerHTML = ""
    for (let i = 0; i < 3; i++) {
        const li = crearElemento("li", "")
        li.setAttribute("aria-hidden", "true")
        const ticket = crearElemento("div", "ticket")
        const imagen = crearElemento("div", "ticket-imagen")
        const cuerpo = crearElemento("div", "ticket-cuerpo")

        imagen.appendChild(crearEsqueleto("esqueleto-poster"))
        cuerpo.appendChild(crearEsqueleto("esqueleto-linea esqueleto-titulo", "70%"))
        cuerpo.appendChild(crearEsqueleto("esqueleto-linea", "90%"))

        ticket.appendChild(imagen)
        ticket.appendChild(cuerpo)
        ticket.appendChild(crearElemento("span", "ticket-numero", "0" + (i + 1)))
        li.appendChild(ticket)
        listaTickets.appendChild(li)
    }
}


function quitarEsqueletos() {
    listaTop.innerHTML = ""
    listaTickets.innerHTML = ""
    heroSeccion.classList.add("hero-sin-tickets")
    mostrarPopcorn(true)
    divArchivo.removeAttribute("aria-busy")
}


let animacionPopcorn = null

function mostrarPopcorn(mostrar) {
    if (!window.lottie) {
        return
    }

    if (mostrar && animacionPopcorn === null) {
        const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        animacionPopcorn = window.lottie.loadAnimation({
            container: document.querySelector("#popcorn"),
            renderer: "svg",
            loop: true,
            autoplay: !sinMovimiento,
            path: "animaciones/popcorn.json"
        })
    } else if (animacionPopcorn !== null) {
        if (mostrar) {
            animacionPopcorn.play()
        } else {
            animacionPopcorn.pause()
        }
    }
}


function pintarTickets() {
    listaTickets.innerHTML = ""

    const podio = miTop.slice(0, 3)

    if (podio.length === 0) {
        heroSeccion.classList.add("hero-sin-tickets")
    } else {
        heroSeccion.classList.remove("hero-sin-tickets")
    }
    mostrarPopcorn(podio.length === 0)

    podio.forEach((item, i) => {
        const pelicula = buscarPelicula(item.pelicula)
        if (!pelicula) {
            return
        }

        const li = crearElemento("li", "")
        const ticket = crearElemento("a", "ticket")
        const imagen = crearElemento("div", "ticket-imagen")
        const cuerpo = crearElemento("div", "ticket-cuerpo")

        ticket.href = "pelicula.html?id=" + pelicula._id
        imagen.appendChild(crearPoster(pelicula))
        cuerpo.appendChild(crearElemento("span", "ticket-titulo", pelicula.nombre))
        cuerpo.appendChild(crearElemento("span", "ticket-texto", pelicula.frase))

        ticket.appendChild(imagen)
        ticket.appendChild(cuerpo)
        ticket.appendChild(crearElemento("span", "ticket-numero", "0" + (i + 1)))
        li.appendChild(ticket)
        listaTickets.appendChild(li)
    })
}


function dosCifras(numero) {
    return numero < 10 ? "0" + numero : String(numero)
}

function pintarTop() {
    listaTop.innerHTML = ""
    btnConfirmar.style.display = "none"

    for (let i = 0; i < MAXIMO; i++) {
        const item = borrador[i]
        const pelicula = item ? buscarPelicula(item.pelicula) : undefined

        const puesto = crearElemento("li", "puesto")
        puesto.appendChild(crearElemento("span", "puesto-numero", dosCifras(i + 1) + "."))

        if (item && miTop[i] && miTop[i]._id !== item._id) {
            btnConfirmar.style.display = ""
        }

        const caja = crearElemento("div", "puesto-caja")
        const pie = crearElemento("div", "puesto-pie")

        if (pelicula) {
            const enlace = crearElemento("a", "puesto-enlace")
            enlace.href = "pelicula.html?id=" + pelicula._id
            enlace.draggable = false
            enlace.appendChild(crearPoster(pelicula))
            caja.appendChild(enlace)
            activarArrastre(puesto, i)

            const btnQuitar = crearElemento("button", "puesto-quitar", "×")
            btnQuitar.type = "button"
            btnQuitar.setAttribute("aria-label", "Quitar " + pelicula.nombre + " de tu Top 10")
            btnQuitar.addEventListener("click", () => {
                quitar(item, pelicula)
            })
            caja.appendChild(btnQuitar)

            pie.appendChild(crearElemento("span", "puesto-nombre", pelicula.nombre))
            pie.appendChild(crearElemento("span", "puesto-anio", pelicula.anio))
        } else if (i === borrador.length) {
            caja.classList.add("puesto-vacio")
            const imagen = crearElemento("div", "puesto-imagen")
            const btnSumar = crearElemento("button", "puesto-sumar", "+")
            btnSumar.type = "button"
            btnSumar.setAttribute("aria-label", "Buscar una película para el puesto " + (i + 1))
            btnSumar.addEventListener("click", () => {
                inpBuscarTop.focus()
            })
            imagen.appendChild(btnSumar)
            caja.appendChild(imagen)
            pie.appendChild(crearElemento("span", "puesto-nombre", "Añadir"))
        } else {
            caja.classList.add("puesto-vacio")
            caja.appendChild(crearElemento("div", "puesto-imagen"))
            pie.appendChild(crearElemento("span", "puesto-nombre", "Nombre"))
            pie.appendChild(crearElemento("span", "puesto-anio", "Año"))
        }

        caja.appendChild(pie)
        puesto.appendChild(caja)
        listaTop.appendChild(puesto)
    }

    pContador.textContent = miTop.length + " de " + MAXIMO + " películas en tu Topster"

    if (miTop.length === MAXIMO) {
        btnExportar.classList.add("listo")
    } else {
        btnExportar.classList.remove("listo")
    }
}


function activarArrastre(puesto, posicion) {
    puesto.draggable = true
    puesto.dataset.posicion = posicion  
    puesto.classList.add("arrastrable")

    puesto.addEventListener("dragstart", arrastrar)
    puesto.addEventListener("dragover", permitirSoltar)
    puesto.addEventListener("dragleave", (evento) => {
        evento.currentTarget.classList.remove("destino")
    })
    puesto.addEventListener("drop", soltar)
    puesto.addEventListener("dragend", terminarArrastre)
}


function arrastrar(evento) {
    arrastrado = Number(evento.currentTarget.dataset.posicion)
    evento.dataTransfer.setData("text/plain", String(arrastrado))  
    evento.dataTransfer.effectAllowed = "move"
    evento.currentTarget.classList.add("arrastrando")
    listaTop.classList.add("ordenando")
}


function permitirSoltar(evento) {
    if (arrastrado === null) {
        return
    }

    evento.preventDefault()
    evento.currentTarget.classList.add("destino")
}


function soltar(evento) {
    if (arrastrado === null) {
        return
    }
    evento.preventDefault()
    const destino = Number(evento.currentTarget.dataset.posicion)
    const item = borrador[arrastrado]

    borrador.splice(arrastrado, 1)      
    borrador.splice(destino, 0, item)   

    terminarArrastre()
    pintarTop()
    pEstadoOrden.textContent = btnConfirmar.style.display === "none" ? "Sin cambios pendientes." : "Hay cambios sin guardar."
}


function terminarArrastre() {
    arrastrado = null
    listaTop.classList.remove("ordenando")
    for (const puesto of listaTop.children) {
        puesto.classList.remove("arrastrando", "destino")
    }
}


async function guardarOrden() {
    btnConfirmar.disabled = true
    const ids = []
    borrador.forEach((item) => {
        ids.push(item._id)
    })
    try {
        miTop = await ordenarTop(ids)
    } catch (error) {
        btnConfirmar.disabled = false
        pEstadoOrden.textContent = "No se pudo guardar. El borrador sigue pendiente."
        mostrarAviso(error.message)
        return
    }

    btnConfirmar.disabled = false
    borrador = miTop.slice()
    pintarTop()
    pintarTickets()
    pEstadoOrden.textContent = "Nuevo orden guardado."
}

btnConfirmar.addEventListener("click", guardarOrden)


btnExportar.addEventListener("click", async () => {
    if (miTop.length < MAXIMO) {
        abrirModal({
            titulo: "Too Fast!",
            texto: "Debes tener 10 películas en tu Topster si quieres exportarlo."
        })
        return
    }


    const peliculasDelTop = []
    miTop.forEach((item) => {
        peliculasDelTop.push(buscarPelicula(item.pelicula))
    })
    btnExportar.disabled = true
    try {
        await exportarTopPNG(peliculasDelTop)
        mostrarAviso("¡Tu Top 10 del Terror se descargó!")
    } catch (error) {
        mostrarAviso("No pudimos exportar la imagen.")
    }
    btnExportar.disabled = false
})


function pintarResultados() {
    divResultados.innerHTML = ""
    const texto = inpBuscarTop.value.trim()

    if (texto === "") {
        divResultados.appendChild(crearVacio("Comienza tu búsqueda."))
        return
    }

    if (cargando) {
        divResultados.appendChild(crearGrillaEsqueletos("resultados-grilla", 6))
        return
    }

    const encontradas = filtrarPeliculas(texto)
    if (encontradas.length === 0) {
        divResultados.appendChild(crearVacio("Tu búsqueda no coincide con nuestros datos."))
        return
    }

    const lista = crearElemento("ul", "resultados-grilla")
    encontradas.forEach((pelicula) => {
        const li = crearElemento("li", "resultado")
        li.appendChild(crearPoster(pelicula))
        li.appendChild(crearElemento("p", "resultado-nombre", pelicula.nombre))
        li.appendChild(crearElemento("p", "resultado-anio", pelicula.anio))

        const boton = crearElemento("button", "boton-agregar", "Agregar")
        boton.type = "button"
        if (buscarEnMiTop(pelicula._id)) {
            boton.textContent = "En tu Top"
            boton.classList.add("ya-agregada")
        }
        boton.addEventListener("click", () => {
            agregar(pelicula)
        })

        li.appendChild(boton)
        lista.appendChild(li)
    })
    divResultados.appendChild(lista)
}


function pintarArchivo() {
    if (cargando) {
        return
    }
    divArchivo.innerHTML = ""   
    divArchivo.removeAttribute("aria-busy")
    const encontradas = filtrarPeliculas(inpBuscarArchivo.value)

    if (encontradas.length === 0) {
        divArchivo.appendChild(crearVacio("Tu búsqueda no coincide con nuestros datos."))
        return
    }

    const lista = crearElemento("ul", "archivo-grilla")
    encontradas.forEach((pelicula) => {
        const li = crearElemento("li", "")
        const tarjeta = crearElemento("a", "tarjeta")
        tarjeta.href = "pelicula.html?id=" + pelicula._id
        tarjeta.appendChild(crearPoster(pelicula))
        tarjeta.appendChild(crearElemento("p", "tarjeta-nombre", pelicula.nombre))
        tarjeta.appendChild(crearElemento("p", "tarjeta-anio", pelicula.anio))
        li.appendChild(tarjeta)
        lista.appendChild(li)
    })
    divArchivo.appendChild(lista)
}


async function refrescarTop() {
    miTop = await obtenerMiTop()
    borrador = miTop.slice()
    pEstadoOrden.textContent = ""
    pintarTop()
    pintarTickets()
    pintarResultados()  
}

async function agregar(pelicula) {
    if (buscarEnMiTop(pelicula._id)) {
        abrirModal({
            titulo: "Double Trouble?",
            texto: "La película seleccionada ya se encuentra en tu Topster."
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

    try {
        await agregarAlTop(pelicula._id)
        await refrescarTop()
        mostrarAviso(pelicula.nombre + " entró a tu Top 10.")
    } catch (error) {
        mostrarAviso(error.message)
    }
}

async function quitar(item, pelicula) {
    try {
        await quitarDelTop(item._id)
        await refrescarTop()
        mostrarAviso(pelicula.nombre + " salió de tu Top 10.")
    } catch (error) {
        mostrarAviso(error.message)
    }
}


inpBuscarTop.addEventListener("input", pintarResultados)
inpBuscarArchivo.addEventListener("input", pintarArchivo)

async function iniciar() {
    activarCerrarSesion()
    pintarEsqueletos()
    pintarResultados()

    try {
        peliculas = await obtenerPeliculas()
        miTop = await obtenerMiTop()
        borrador = miTop.slice()  
    } catch (error) {
        quitarEsqueletos()
        divArchivo.innerHTML = ""
        divArchivo.appendChild(crearVacio(error.message))
        divResultados.innerHTML = ""
        pContador.textContent = error.message
        return
    }
    cargando = false

    pintarTickets()
    pintarTop()
    pintarResultados()
    pintarArchivo()
}

if (!leerToken()) {
    window.location.href = "login.html"
} else {
    iniciar()
}
