export function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta)
    if (clase) {
        elemento.className = clase
    }
    if (texto !== undefined) {
        elemento.textContent = texto
    }
    return elemento
}

export function crearPoster(pelicula) {
    const poster = crearElemento("div", "poster")

    poster.classList.add("poster-tipografico")
    poster.classList.add("tono-" + (pelicula.anio % 4))
    poster.appendChild(crearElemento("span", "poster-anio", pelicula.anio))
    poster.appendChild(crearElemento("span", "poster-nombre", pelicula.nombre))

    if (pelicula.imagen) {
        const img = document.createElement("img")
        img.src = pelicula.imagen
        img.alt = "Póster de " + pelicula.nombre
        img.addEventListener("error", () => {
            img.remove()
        })

        img.addEventListener("load", () => {
            poster.classList.add("con-imagen")
        })
        poster.appendChild(img)
    }
    return poster
}


export function crearEsqueleto(clase, ancho) {
    const esqueleto = crearElemento("span", "esqueleto " + clase)
    esqueleto.setAttribute("aria-hidden", "true")
    if (ancho) {
        esqueleto.style.width = ancho
    }
    return esqueleto
}

export function crearGrillaEsqueletos(claseGrilla, cantidad) {
    const lista = crearElemento("ul", claseGrilla)
    lista.setAttribute("aria-hidden", "true")
    for (let i = 0; i < cantidad; i++) {
        const li = crearElemento("li", "")
        li.appendChild(crearEsqueleto("esqueleto-poster"))
        li.appendChild(crearEsqueleto("esqueleto-barra"))
        lista.appendChild(li)
    }
    return lista
}

let temporizadorAviso = null

export function mostrarAviso(texto) {
    const aviso = document.querySelector("#aviso")
    aviso.textContent = texto
    aviso.classList.add("visible")

    clearTimeout(temporizadorAviso)
    temporizadorAviso = setTimeout(() => {
        aviso.classList.remove("visible")
    }, 3500)
}


const FOTOS_ACCESO = [
    { archivo: "img/scream.png", foco: "50% 30%" },
    { archivo: "img/obsession.png", foco: "50% 30%" },
    { archivo: "img/sinners.webp", foco: "75% 40%" },
    { archivo: "img/midsommar.png", foco: "50% 30%" },
    { archivo: "img/shining.jpg", foco: "58% 50%" },
    { archivo: "img/carrie.jpg", foco: "55% 50%" }
]

export function activarFotosAcceso() {
    const contenedor = document.querySelector(".acceso-imagen")

  
    const indice = Math.floor(Math.random() * FOTOS_ACCESO.length)
    const elegida = FOTOS_ACCESO[indice]

    contenedor.style.backgroundImage = "url('" + elegida.archivo + "')"
    contenedor.style.backgroundPosition = elegida.foco
}

export function activarBotonesOjo() {
    const botones = document.querySelectorAll(".boton-ojo")

    botones.forEach((boton) => {
        boton.addEventListener("click", () => {
            const input = document.querySelector("#" + boton.dataset.input)

            if (input.type === "password") {
                input.type = "text"
                boton.classList.add("activo")
                boton.setAttribute("aria-label", "Ocultar contraseña")
            } else {
                input.type = "password"
                boton.classList.remove("activo")
                boton.setAttribute("aria-label", "Mostrar contraseña")
            }
        })
    })
}
