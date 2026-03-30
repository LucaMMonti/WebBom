/**
 * Mapa de cobertura — editá estas listas.
 * - Por defecto todo es VERDE; lo que agregues acá se pinta en ROJO.
 * - Podés escribir con o sin tildes: se comparan sin acentos.
 *
 * Nombres CABA: como en data GCBA (ej. "Almagro", "Villa del Parque", "Once").
 * Partidos en el mapa: ~39 del AMBA (conurbano). Para sumar otro partido
 * hay que agregarlo al script que genera data/amba-partidos.geojson (lista AMBA en el repo).
 */
window.HOMEFIX_COVERAGE = {
  /** Barrios de CABA sin cobertura → rojo */
  cabaSinCobertura: [
    /* ejemplos: "Boedo", "Parque Patricios" */
  ],

  /** Partidos del AMBA mostrados en el mapa sin cobertura → rojo */
  ambaSinCobertura: [
    "Zárate",
    "Campana",
    "Exaltación de la Cruz",
    "Cañuelas",
    "Brandsen",
    "San Vicente",
    "Berisso",
  ],
};
