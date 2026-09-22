import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().transform((value) => value || undefined);

export const rsvpPayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  attending: z.enum(["yes", "no"]),
  guestCount: z.coerce.number().int().min(1).max(20),
  dietary: optionalText(500),
  message: optionalText(1000),
  turnstileToken: z.string().max(4096),
  honeypot: z.string().max(200).optional().default(""),
}).strict();

export const songRequestPayloadSchema = z.object({
  guestName: z.string().trim().min(2).max(120),
  artist: z.string().trim().min(1).max(150),
  title: z.string().trim().min(1).max(200),
  link: z.union([z.string().trim().url().max(500), z.literal("")]).optional().transform((value) => value || undefined),
  turnstileToken: z.string().max(4096),
  honeypot: z.string().max(200).optional().default(""),
}).strict();

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(500),
}).strict();

export type RsvpPayload = z.infer<typeof rsvpPayloadSchema>;
export type SongRequestPayload = z.infer<typeof songRequestPayloadSchema>;
