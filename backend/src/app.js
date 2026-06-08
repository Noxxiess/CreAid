import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { userRoutes } from "./routes/users.js";
import { authRoutes } from "./routes/auth.js";
import { profileRoutes } from "./routes/profile.js";
import { appointmentRoutes } from "./routes/appointments.js";
import {servicesRoutes} from "./routes/services.js";

export const app = new Elysia({
  prefix: "/api"
})

.use(
  cors({
    origin: true,
    credentials: true,
  })
)

/* IMPORTANT */
.onError(({ code, error }) => {

  console.log(
    "SERVER ERROR:",
    code,
    error
  );
})

.get("/health", () => ({
  success: true,
  message: "DentConnect API running",
}))

.use(userRoutes)
.use(authRoutes)
.use(profileRoutes)
.use(appointmentRoutes)
.use(servicesRoutes);

