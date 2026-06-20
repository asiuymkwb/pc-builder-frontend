/*
 * types/index.ts — definizioni TypeScript dei modelli dati.
 *
 * Questi tipi rispecchiano i modelli Eloquent del backend Laravel.
 * Ogni tipo corrisponde a una tabella del database:
 *   User → users, Category → categories, Component → components,
 *   Build → builds, CompatibilityResult → risposta del CompatibilityService.
 *
 * Usare tipi centralizzati evita di ridefinire le stesse strutture
 * in ogni componente e garantisce che frontend e backend parlino
 * la stessa "lingua" per i dati.
 */

// Utente autenticato. role = "user" | "admin" determina i permessi.
export type User = {
  id: number
  name: string
  email: string
  role: "user" | "admin"
}

// Categoria di componenti (CPU, GPU, RAM…). Lo slug è usato come chiave
// nei filtri API e nella mappatura categoria→componente nel Builder.
export type Category = {
  id: number
  name: string
  slug: string
  icon: string
  sort_order: number
}

// Specifica tecnica di un componente (es. socket=AM5, ddr_gen=DDR5).
// Salvata in tabella component_specs con chiave/valore per flessibilità.
export type ComponentSpec = {
  id: number
  component_id: number
  spec_key: string
  spec_value: string
}

// Componente hardware. pivot.quantity viene dalla tabella pivot build_components
// e indica quante unità di quel componente sono presenti nella build.
export type Component = {
  id: number
  category_id: number
  name: string
  brand: string
  model: string
  price: number
  wattage: number
  image_url: string | null
  buy_url: string | null
  stock: boolean
  is_active: boolean
  category?: Category
  specs?: ComponentSpec[]
  pivot?: { quantity: number }
}

// Configurazione PC salvata dall'utente. total_price e total_wattage
// vengono ricalcolati automaticamente dal BuildService ad ogni modifica.
export type Build = {
  id: number
  user_id: number
  name: string
  total_price: number
  total_wattage: number
  is_complete: boolean
  components?: Component[]
  components_count?: number
  created_at: string
}

// Risultato del controllo compatibilità. errors = incompatibilità bloccanti
// (es. socket CPU/motherboard non coincide), warnings = avvisi non bloccanti.
export type CompatibilityResult = {
  is_compatible: boolean
  errors: { rule: string; message: string }[]
  warnings: { rule: string; message: string }[]
}

export type Quote = {
  id: number
  build_id: number
  user_id: number
  generated_at: string
}
