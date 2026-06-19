import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication
} from "./db.js";
import { applicationCreateSchema, applicationUpdateSchema, querySchema } from "./validation.js";

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/applications", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    res.json(await listApplications(query));
  } catch (error) {
    next(error);
  }
});

app.get("/applications/:id", async (req, res, next) => {
  try {
    const application = await getApplication(Number(req.params.id));

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
});

app.post("/applications", async (req, res, next) => {
  try {
    const body = applicationCreateSchema.parse(req.body);
    const application = await createApplication(body);

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
});

app.patch("/applications/:id", async (req, res, next) => {
  try {
    const body = applicationUpdateSchema.parse(req.body);
    const id = Number(req.params.id);
    const existing = await getApplication(id);

    if (!existing) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    const application = await updateApplication(id, body);

    res.json(application);
  } catch (error) {
    next(error);
  }
});

app.delete("/applications/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const existing = await getApplication(id);

    if (!existing) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    await deleteApplication(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      errors: error.flatten().fieldErrors
    });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Something went wrong" });
};

app.use(errorHandler);
