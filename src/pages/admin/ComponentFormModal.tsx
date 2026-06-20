import { useEffect, useState } from "react"
import { myFetch } from "@/lib/backend"
import type { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Save } from "lucide-react"

const CATEGORY_SPECS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  cpu: [
    { key: "socket",        label: "Socket",          placeholder: "LGA1700" },
    { key: "ddr_support",   label: "DDR supportata",  placeholder: "DDR4,DDR5" },
    { key: "max_ram_speed", label: "Velocità RAM max", placeholder: "5600" },
    { key: "tdp_watt",      label: "TDP (W)",         placeholder: "125" },
  ],
  motherboard: [
    { key: "socket",        label: "Socket",          placeholder: "LGA1700" },
    { key: "ddr_gen",       label: "Generazione DDR", placeholder: "DDR5" },
    { key: "form_factor",   label: "Form factor",     placeholder: "ATX" },
    { key: "max_ram_slots", label: "Slot RAM",        placeholder: "4" },
    { key: "max_ram_gb",    label: "RAM max (GB)",    placeholder: "128" },
    { key: "m2_slots",      label: "Slot M.2",        placeholder: "3" },
  ],
  ram: [
    { key: "ddr_gen",     label: "Generazione DDR", placeholder: "DDR5" },
    { key: "speed_mhz",   label: "Velocità (MHz)",  placeholder: "5600" },
    { key: "capacity_gb", label: "Capacità (GB)",   placeholder: "32" },
    { key: "form_factor", label: "Form factor",     placeholder: "DIMM" },
  ],
  gpu: [
    { key: "tdp_watt",     label: "TDP (W)",        placeholder: "320" },
    { key: "length_mm",    label: "Lunghezza (mm)", placeholder: "336" },
    { key: "pcie_version", label: "PCIe",           placeholder: "PCIe 4.0" },
  ],
  psu: [
    { key: "wattage_max",   label: "Potenza max (W)",  placeholder: "850" },
    { key: "form_factor",   label: "Form factor",       placeholder: "ATX" },
    { key: "certification", label: "Certificazione",    placeholder: "80+ Gold" },
  ],
  case: [
    { key: "form_factor",          label: "Form factor supportati",       placeholder: "ATX,Micro-ATX,Mini-ITX" },
    { key: "max_gpu_length_mm",    label: "Lunghezza GPU max (mm)",       placeholder: "420" },
    { key: "max_cooler_height_mm", label: "Altezza dissipatore max (mm)", placeholder: "170" },
  ],
  storage: [
    { key: "interface",   label: "Interfaccia",   placeholder: "NVMe M.2" },
    { key: "capacity_gb", label: "Capacità (GB)", placeholder: "1000" },
  ],
  "cpu-cooler": [
    { key: "socket_compat", label: "Socket compatibili", placeholder: "LGA1700,AM5,AM4" },
    { key: "height_mm",     label: "Altezza (mm)",       placeholder: "158" },
    { key: "max_tdp",       label: "TDP max (W)",        placeholder: "250" },
  ],
}

type Props = {
  open: boolean
  editId: number | null
  onClose: () => void
  onSaved: () => void
}

export default function ComponentFormModal({ open, editId, onClose, onSaved }: Props) {
  const isEdit = editId !== null

  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [categoryId, setCategoryId] = useState("")
  const [name, setName]             = useState("")
  const [brand, setBrand]           = useState("")
  const [model, setModel]           = useState("")
  const [price, setPrice]           = useState("")
  const [wattage, setWattage]       = useState("")
  const [imageUrl, setImageUrl]     = useState("")
  const [buyUrl, setBuyUrl]         = useState("")
  const [stock, setStock]           = useState(true)
  const [specs, setSpecs]           = useState<Record<string, string>>({})

  const selectedCategory = categories.find((c) => String(c.id) === categoryId)
  const specFields = selectedCategory ? (CATEGORY_SPECS[selectedCategory.slug] ?? []) : []

  useEffect(() => {
    myFetch<Category[]>("/categories").then(setCategories)
  }, [])

  // carica dati se in modifica
  useEffect(() => {
    if (!open) return
    if (!isEdit) {
      setCategoryId(""); setName(""); setBrand(""); setModel("")
      setPrice(""); setWattage(""); setImageUrl(""); setBuyUrl("")
      setStock(true); setSpecs({}); setError(null)
      return
    }
    myFetch<any>(`/admin/components/${editId}`).then((c) => {
      setCategoryId(String(c.category_id))
      setName(c.name); setBrand(c.brand); setModel(c.model)
      setPrice(String(c.price)); setWattage(String(c.wattage))
      setImageUrl(c.image_url ?? ""); setBuyUrl(c.buy_url ?? "")
      setStock(c.stock)
      const specMap: Record<string, string> = {}
      for (const s of c.specs ?? []) specMap[s.spec_key] = s.spec_value
      setSpecs(specMap)
    })
  }, [open, editId])

  // reset spec al cambio categoria
  useEffect(() => {
    if (!isEdit) setSpecs({})
  }, [categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const specsArray = specFields
      .map((f) => ({ spec_key: f.key, spec_value: specs[f.key] ?? "" }))
      .filter((s) => s.spec_value !== "")

    const payload = {
      category_id: Number(categoryId),
      name, brand, model,
      price: parseFloat(price),
      wattage: parseInt(wattage),
      image_url: imageUrl || null,
      buy_url: buyUrl || null,
      stock,
      specs: specsArray,
    }

    try {
      if (isEdit) {
        await myFetch(`/admin/components/${editId}`, { method: "PUT", body: JSON.stringify(payload) })
      } else {
        await myFetch("/admin/components", { method: "POST", body: JSON.stringify(payload) })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il salvataggio.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEdit ? "Modifica componente" : "Nuovo componente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="m-category">Categoria</Label>
            <select
              id="m-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="">Seleziona categoria...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Informazioni base
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="m-name">Nome</Label>
                <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-brand">Brand</Label>
                <Input id="m-brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-model">Modello</Label>
                <Input id="m-model" value={model} onChange={(e) => setModel(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-price">Prezzo (€)</Label>
                <Input id="m-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-wattage">Wattaggio TDP (W)</Label>
                <Input id="m-wattage" type="number" min="0" value={wattage} onChange={(e) => setWattage(e.target.value)} required />
              </div>
              <div className="flex items-center pt-5">
                <label htmlFor="m-stock" className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    id="m-stock"
                    type="checkbox"
                    checked={stock}
                    onChange={(e) => setStock(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-sm font-medium">Disponibile (in stock)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Link esterni
            </p>
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Label htmlFor="m-image_url">URL Immagine</Label>
                <Input id="m-image_url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-buy_url">URL Amazon</Label>
                <Input id="m-buy_url" value={buyUrl} onChange={(e) => setBuyUrl(e.target.value)} placeholder="https://www.amazon.it/..." />
              </div>
            </div>
          </div>

          {specFields.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Specifiche tecniche
              </p>
              <div className="grid grid-cols-2 gap-3">
                {specFields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={`m-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`m-${field.key}`}
                      value={specs[field.key] ?? ""}
                      onChange={(e) => setSpecs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-md">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1 border-t border-border">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Salvataggio..." : "Salva"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
