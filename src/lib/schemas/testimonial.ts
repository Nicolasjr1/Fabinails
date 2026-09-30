import { z } from "zod"

export const testimonialFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome muito longo"),
  text: z.string().min(10, "Depoimento muito curto (mín 10 caracteres)").max(500, "Depoimento muito longo (máx 500)"),
  rating: z.number().int().min(1, "Nota 1-5").max(5, "Nota 1-5"),
})

export const testimonialStatusSchema = z.enum(["pending", "approved", "rejected"])

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>
