import { Routes } from "@angular/router";
import { AUTH_ROUTES } from "../../../shared/constants/routes.const";

export const authRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>  import("./auth.layout").then(m => m.AuthLayoutComponent),
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: AUTH_ROUTES.LOGIN,
      },
      {
        path: AUTH_ROUTES.LOGIN,
        loadComponent: () => import("./login/login").then(m => m.Login),
      },
      {
        path: AUTH_ROUTES.SIGNUP,
        loadComponent: () => import("./signup/signup").then(m => m.Signup),
      },
      {
        path: `${AUTH_ROUTES.VERIFY_EMAIL}/:token`,
        loadComponent: () => import("./verify-email/verify-email").then(m => m.VerifyEmail),
      },
    ],
  }
]
