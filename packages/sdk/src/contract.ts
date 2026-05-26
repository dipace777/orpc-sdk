import { oc } from "@orpc/contract";
import { z } from "zod";

export const HealthSchema = z.object({
  ok: z.boolean(),
  service: z.literal("agent-runtime-api"),
  time: z.string(),
});

export const ApiIdentitySchema = z.object({
  apiKeyId: z.string(),
  apiKeyName: z.string().nullable(),
  userId: z.string().nullable(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});

export const contract = {
  system: {
    health: oc.output(HealthSchema),
    whoami: oc.output(ApiIdentitySchema),
  },
  projects: {
    list: oc
      .input(
        z.object({
          limit: z.number().int().min(1).max(50).default(10),
        }),
      )
      .output(z.array(ProjectSchema)),
    create: oc
      .input(
        z.object({
          name: z.string().trim().min(2).max(80),
        }),
      )
      .output(ProjectSchema),
  },
};

export type ApiContract = typeof contract;
export type ApiIdentity = z.infer<typeof ApiIdentitySchema>;
export type Project = z.infer<typeof ProjectSchema>;
