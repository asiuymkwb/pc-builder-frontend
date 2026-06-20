/*
 * api/auth.ts — chiamate API per autenticazione e profilo utente.
 *
 * login/register usano le route pubbliche del backend.
 * adminLogin chiama POST /admin/login che verifica anche il ruolo "admin".
 * me() recupera l'utente loggato dal token Bearer (usato al caricamento app).
 * logout() revoca il token Sanctum lato server.
 */
import { myFetch } from "@/lib/backend"
import type { User } from "@/types"

type AuthResponse = { user: User; token: string }

export const AuthApi = {
  login: (email: string, password: string) =>
    myFetch<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  adminLogin: (email: string, password: string) =>
    myFetch<AuthResponse>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, password_confirmation: string) =>
    myFetch<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, password_confirmation }),
    }),

  logout: () =>
    myFetch<{ message: string }>("/logout", { method: "POST" }),

  me: () =>
    myFetch<User>("/me"),
}
