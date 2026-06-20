import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@/context/AuthContext"
import { myFetch } from "@/lib/backend"
import type { Component, Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Cpu, LogOut, Plus, Pencil, Trash2, Search,
  LayoutGrid, ArrowLeft, Users, ShieldCheck, ShieldOff, Ban, Menu,
} from "lucide-react"
import * as Icons from "lucide-react"
import ComponentFormModal from "@/pages/admin/ComponentFormModal"
import { cn } from "@/lib/utils"

type PaginatedComponents = {
  data: Component[]
  current_page: number
  last_page: number
  total: number
}

type Stats = {
  total_components: number
  builds_today: number
  total_users: number
  most_used_component?: { id: number; name: string; brand: string } | null
}

type UserItem = {
  id: number
  name: string
  email: string
  role: "user" | "admin" | "banned"
  created_at: string
}

type View = "components" | "users"

export default function AdminDashboard() {
  const { user: me, logout } = useAuth()
  const navigate = useNavigate()

  const [view, setView] = useState<View>("components")

  // stato componenti
  const [categories, setCategories] = useState<Category[]>([])
  const [components, setComponents] = useState<Component[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  // stato utenti
  const [users, setUsers] = useState<UserItem[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null)

  useEffect(() => {
    myFetch<Category[]>("/categories").then(setCategories)
    myFetch<Stats>("/admin/stats").then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    if (view !== "components") return
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (search) params.set("search", search)
    myFetch<PaginatedComponents>(`/admin/components?${params}`)
      .then((res) => {
        setComponents(res.data)
        setLastPage(res.last_page)
        setTotal(res.total)
      })
      .finally(() => setLoading(false))
  }, [view, selectedCategory, search, page])

  useEffect(() => {
    if (view !== "users") return
    setUsersLoading(true)
    myFetch<UserItem[]>("/admin/users")
      .then(setUsers)
      .finally(() => setUsersLoading(false))
  }, [view])

  const refreshComponents = () => {
    setPage(1)
    const params = new URLSearchParams({ page: "1" })
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (search) params.set("search", search)
    setLoading(true)
    myFetch<PaginatedComponents>(`/admin/components?${params}`)
      .then((res) => {
        setComponents(res.data)
        setLastPage(res.last_page)
        setTotal(res.total)
      })
      .finally(() => setLoading(false))
    myFetch<Stats>("/admin/stats").then(setStats).catch(() => {})
  }

  const handleDeleteComponent = async () => {
    if (!deleteId) return
    await myFetch(`/admin/components/${deleteId}`, { method: "DELETE" })
    setComponents((prev) => prev.filter((c) => c.id !== deleteId))
    setTotal((prev) => prev - 1)
    setDeleteId(null)
    myFetch<Stats>("/admin/stats").then(setStats).catch(() => {})
  }

  const handleChangeRole = async (userId: number, role: UserItem["role"]) => {
    const updated = await myFetch<UserItem>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    })
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  const handleDeleteUser = async () => {
    if (!deleteUserId) return
    await myFetch(`/admin/users/${deleteUserId}`, { method: "DELETE" })
    setUsers((prev) => prev.filter((u) => u.id !== deleteUserId))
    setDeleteUserId(null)
    myFetch<Stats>("/admin/stats").then(setStats).catch(() => {})
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const openCreate = () => { setEditId(null); setFormOpen(true) }
  const openEdit   = (id: number) => { setEditId(id); setFormOpen(true) }

  const componentToDelete = components.find((c) => c.id === deleteId)
  const userToDelete = users.find((u) => u.id === deleteUserId)
  const currentCategoryName = categories.find((c) => c.slug === selectedCategory)?.name

  return (
    <div className="h-screen flex bg-background overflow-hidden">

      {/* sidebar */}
      <div className="dark flex-shrink-0 hidden md:block">
        <aside className="w-60 h-screen flex flex-col bg-background border-r border-border">

          <div className="px-5 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-foreground">PC Builder</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 ml-6">Pannello amministrazione</p>
          </div>

          {stats && (
            <div className="px-5 py-5 border-b border-border">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">
                    {stats.total_components}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Componenti</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">
                    {stats.builds_today}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Build oggi</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">
                    {stats.total_users}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Utenti</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 px-3 py-3 overflow-y-auto">

            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Catalogo
            </p>
            <SidebarItem
              icon={LayoutGrid}
              label="Tutti i componenti"
              count={view === "components" && selectedCategory === "all" ? total : undefined}
              active={view === "components" && selectedCategory === "all"}
              onClick={() => { setView("components"); setSelectedCategory("all"); setPage(1) }}
            />
            {categories.map((cat) => {
              const CatIcon = (Icons as Record<string, React.ElementType>)[cat.icon] ?? Icons.Box
              return (
                <SidebarItem
                  key={cat.id}
                  icon={CatIcon}
                  label={cat.name}
                  count={view === "components" && selectedCategory === cat.slug ? total : undefined}
                  active={view === "components" && selectedCategory === cat.slug}
                  onClick={() => { setView("components"); setSelectedCategory(cat.slug); setPage(1) }}
                />
              )
            })}

            <p className="px-3 py-1.5 mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Gestione
            </p>
            <SidebarItem
              icon={Users}
              label="Utenti"
              count={view === "users" ? users.length : undefined}
              active={view === "users"}
              onClick={() => setView("users")}
            />
          </nav>

          <div className="px-3 py-4 border-t border-border space-y-1">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left"
            >
              <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
              Vai al Builder
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              Esci
            </button>
          </div>
        </aside>
      </div>

      {/* sidebar mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="dark w-60 p-0 bg-background border-r border-border flex flex-col">

          <div className="px-5 py-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-foreground">PC Builder</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 ml-6">Pannello amministrazione</p>
          </div>

          {stats && (
            <div className="px-5 py-5 border-b border-border">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{stats.total_components}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Componenti</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{stats.builds_today}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Build oggi</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{stats.total_users}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Utenti</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 px-3 py-3 overflow-y-auto">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Catalogo
            </p>
            <SidebarItem
              icon={LayoutGrid}
              label="Tutti i componenti"
              count={view === "components" && selectedCategory === "all" ? total : undefined}
              active={view === "components" && selectedCategory === "all"}
              onClick={() => { setView("components"); setSelectedCategory("all"); setPage(1); setSidebarOpen(false) }}
            />
            {categories.map((cat) => {
              const CatIcon = (Icons as Record<string, React.ElementType>)[cat.icon] ?? Icons.Box
              return (
                <SidebarItem
                  key={cat.id}
                  icon={CatIcon}
                  label={cat.name}
                  count={view === "components" && selectedCategory === cat.slug ? total : undefined}
                  active={view === "components" && selectedCategory === cat.slug}
                  onClick={() => { setView("components"); setSelectedCategory(cat.slug); setPage(1); setSidebarOpen(false) }}
                />
              )
            })}
            <p className="px-3 py-1.5 mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Gestione
            </p>
            <SidebarItem
              icon={Users}
              label="Utenti"
              count={view === "users" ? users.length : undefined}
              active={view === "users"}
              onClick={() => { setView("users"); setSidebarOpen(false) }}
            />
          </nav>

          <div className="px-3 py-4 border-t border-border space-y-1">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left"
            >
              <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
              Vai al Builder
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              Esci
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* contenuto principale */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {view === "components" && (
          <>
            <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-sm font-semibold">
                    {selectedCategory === "all" ? "Tutti i componenti" : (currentCategoryName ?? "Componenti")}
                  </h1>
                  <p className="text-xs text-muted-foreground">{total} in totale</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Cerca componente..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                    className="pl-9 h-9 w-56 text-sm"
                  />
                </div>
                <Button size="icon" onClick={openCreate} className="h-9 w-9" title="Aggiungi componente">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="sm:hidden px-4 py-2 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Cerca componente..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="pl-9 h-9 w-full text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto px-4 sm:px-6 py-5">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : components.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm text-muted-foreground">Nessun componente trovato.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground w-14" />
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Componente</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Categoria</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Prezzo</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground pl-6">Stock</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((component) => (
                      <tr
                        key={component.id}
                        className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 pr-3">
                          <div className="w-11 h-9 rounded bg-muted/50 flex items-center justify-center overflow-hidden">
                            {component.image_url ? (
                              <img
                                src={component.image_url}
                                alt={component.name}
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="text-xs text-muted-foreground">{component.brand}</p>
                          <p className="font-medium text-sm leading-tight">{component.name}</p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-xs text-muted-foreground">
                            {component.category?.name ?? "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                          €{Number(component.price).toFixed(2)}
                        </td>
                        <td className="py-3 pl-6">
                          <span className={cn(
                            "text-xs font-medium",
                            component.stock
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-destructive"
                          )}>
                            {component.stock ? "Disponibile" : "Esaurito"}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(component.id)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteId(component.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>

            {lastPage > 1 && (
              <div className="px-6 py-3 border-t border-border flex items-center justify-between flex-shrink-0">
                <p className="text-xs text-muted-foreground">
                  Pagina {page} di {lastPage} · {total} componenti
                </p>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Precedente
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
                    Successiva
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {view === "users" && (
          <>
            <div className="px-4 sm:px-6 h-14 flex items-center gap-3 border-b border-border flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-sm font-semibold">Gestione utenti</h1>
                <p className="text-xs text-muted-foreground">{users.length} registrati</p>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5">
              {usersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm text-muted-foreground">Nessun utente trovato.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Nome</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Ruolo</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Registrato</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isMe = u.id === me?.id
                      return (
                        <tr
                          key={u.id}
                          className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <p className="font-medium">{u.name}</p>
                            {isMe && (
                              <p className="text-[10px] text-muted-foreground">(tu)</p>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{u.email}</td>
                          <td className="py-3 pr-4">
                            <RoleBadge role={u.role} />
                          </td>
                          <td className="py-3 pr-4 text-xs text-muted-foreground tabular-nums">
                            {new Date(u.created_at).toLocaleDateString("it-IT")}
                          </td>
                          <td className="py-3">
                            {!isMe && (
                              <div className="flex items-center justify-end gap-1">
                                {u.role !== "admin" && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title="Promuovi ad admin"
                                    onClick={() => handleChangeRole(u.id, "admin")}
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  </Button>
                                )}
                                {u.role === "admin" && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title="Revoca admin"
                                    onClick={() => handleChangeRole(u.id, "user")}
                                  >
                                    <ShieldOff className="w-3.5 h-3.5 text-amber-500" />
                                  </Button>
                                )}
                                {u.role !== "banned" ? (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title="Banna utente"
                                    onClick={() => handleChangeRole(u.id, "banned")}
                                  >
                                    <Ban className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title="Riabilita utente"
                                    onClick={() => handleChangeRole(u.id, "user")}
                                  >
                                    <Ban className="w-3.5 h-3.5 text-destructive" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  title="Elimina utente"
                                  onClick={() => setDeleteUserId(u.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* modale form */}
      <ComponentFormModal
        open={formOpen}
        editId={editId}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); refreshComponents() }}
      />

      {/* dialog elimina componente */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disattivare il componente?</AlertDialogTitle>
            <AlertDialogDescription>
              "{componentToDelete?.name}" verrà nascosto dal catalogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComponent}>Disattiva</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* dialog elimina utente */}
      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare l'utente?</AlertDialogTitle>
            <AlertDialogDescription>
              "{userToDelete?.name}" e tutte le sue build verranno eliminati definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RoleBadge({ role }: { role: UserItem["role"] }) {
  const styles = {
    admin:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    user:   "bg-muted text-muted-foreground",
    banned: "bg-destructive/10 text-destructive",
  }
  const labels = { admin: "Admin", user: "Utente", banned: "Bannato" }
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", styles[role])}>
      {labels[role]}
    </span>
  )
}

function SidebarItem({
  icon: Icon, label, count, active, onClick,
}: {
  icon: React.ElementType
  label: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left",
        active
          ? "bg-white/10 text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      )}
    </button>
  )
}
