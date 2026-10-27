// js/app.js · La interfaz: estado, DOM y eventos.
import { obtenerEpisodios } from './api.js';
import { filtrarEpisodios, contarPersonajes, alternarId } from './logica.js';
import { leerVistos, guardarVistos } from './vistos.js';

// ============ ESTADO ============
let episodios = [];                          // lo que llegó de la API
let vistos = leerVistos();                   // ids de los episodios marcados como vistos
const filtros = { texto: '', temporada: '' };

// ============ DOM ============
const lista = document.querySelector('#lista');
const contador = document.querySelector('#contador');
const formFiltros = document.querySelector('#form-filtros');
const inputBusqueda = document.querySelector('#busqueda');
const selectTemporada = document.querySelector('#filtro-temporada');

// R2 · Estado de carga y estado de error (modelos 3 y 4 de index.html).
const mostrarCargando = () => {
  lista.innerHTML = `<p class="col-span-full rounded-2xl bg-white p-8 text-center text-slate-500">Cargando episodios…</p>`;
};

const mostrarError = (mensaje) => {
  lista.innerHTML = `
    <div class="col-span-full rounded-2xl bg-rose-50 p-8 text-center text-rose-700">
      <p>No se pudieron cargar los episodios (${mensaje}).</p>
      <button type="button" id="btn-reintentar"
              class="mt-4 rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700">
        Reintentar
      </button>
    </div>
  `;
};

// R2 · Pide los episodios: muestra cargando; si todo sale bien guarda y pinta;
// si falla, muestra el error con su botón Reintentar.
const cargar = async () => {
  mostrarCargando();
  try {
    episodios = await obtenerEpisodios();
    render();
  } catch (error) {
    mostrarError(error.message);
  }
};

// R3 · Recibe UN episodio y devuelve el HTML de su tarjeta (modelos 1 y 2 de index.html).
const tarjetaHTML = (episodio) => {
  const esVisto = vistos.includes(episodio.id);
  
  const articleClasses = esVisto 
    ? 'flex flex-col gap-2 rounded-2xl bg-white p-5 shadow ring-2 ring-emerald-500' 
    : 'flex flex-col gap-2 rounded-2xl bg-white p-5 shadow';
    
  const btnClasses = esVisto
    ? 'mt-auto rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700'
    : 'mt-auto rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700';
    
  const btnText = esVisto ? '✓ Visto' : 'Marcar como visto';

  return `
    <article class="${articleClasses}">
      <span class="w-fit rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">${episodio.episode}</span>
      <h3 class="text-lg font-bold">${episodio.name}</h3>
      <p class="text-sm text-slate-500">Emitido: ${episodio.air_date}</p>
      <p class="text-sm text-slate-500">${episodio.characters.length} personajes</p>
      <button type="button" data-id="${episodio.id}" class="${btnClasses}">
        ${btnText}
      </button>
    </article>
  `;
};

// R3 + R4 + R5 · ESTADO → pantalla: filtra, pinta las tarjetas (o el estado vacío, modelo 5)
// y actualiza el contador con el formato «7 de 20 episodios · 187 personajes».
const render = () => {
  const visibles = filtrarEpisodios(episodios, filtros);
  const totalPersonajes = contarPersonajes(visibles);
  contador.textContent = `${visibles.length} de ${episodios.length} episodios · ${totalPersonajes} personajes`;
  if (visibles.length === 0) {
    lista.innerHTML = `<p class="col-span-full rounded-2xl bg-white p-8 text-center text-slate-500">Ningún episodio coincide con la búsqueda.</p>`;
  } else {
    lista.innerHTML = visibles.map(tarjetaHTML).join('');
  }
};

// R4 · Eventos del buscador (input), del select (change) y del formulario (Enter NO recarga).
// TODO
inputBusqueda.addEventListener('input', (evento) => {
  filtros.texto = evento.target.value;
  render();
});
selectTemporada.addEventListener('change', (evento) => {
  filtros.temporada = evento.target.value;
  render(); 
});
formFiltros.addEventListener('submit', (evento) => evento.preventDefault());

// R6 · UN solo listener en #lista (delegación) que atienda el botón de cada tarjeta
// y también el botón Reintentar.

lista.addEventListener('click', (evento) => {
  if (evento.target.closest('#btn-reintentar')) {
    cargar(); 
    return;
  }

  const botonTarjeta = evento.target.closest('[data-id]');
  if (botonTarjeta) {
    const id = Number(botonTarjeta.dataset.id);
    vistos = alternarId(vistos, id);
    guardarVistos(vistos);
    render();
  }
});
cargar();
