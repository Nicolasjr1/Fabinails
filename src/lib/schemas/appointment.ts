import { z } from "zod"

export const appointmentFormSchema = z.object({
  clientName: z.string().min(2, "Nome é obrigatório"),
  clientWhatsapp: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "WhatsApp inválido"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Horário inválido"),
})

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

export const serviceOptions = [
  { value: "Alongamento", label: "Alongamento - R$ 150,00 (2h)" },
  { value: "Manutenção", label: "Manutenção - R$ 100,00 (2h)" },
  { value: "Banho de Gel", label: "Banho de Gel - R$ 100,00 (2h)" },
] as const
