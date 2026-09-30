import { appointmentFormSchema } from "../src/lib/schemas/appointment"

describe("Appointment Form Schema", () => {
  const validInput = {
    clientName: "Maria Silva",
    clientWhatsapp: "+5543996524776",
    serviceId: "cm123456789",
    date: "2026-08-20",
    time: "09:00",
  }

  it("validates valid data", () => {
    const validResult = appointmentFormSchema.safeParse(validInput)
    expect(validResult.success).toBe(true)
  })

  it("rejects missing name", () => {
    const invalidResult = appointmentFormSchema.safeParse({
      ...validInput,
      clientName: "",
    })
    expect(invalidResult.success).toBe(false)
  })

  it("rejects invalid whatsapp", () => {
    const invalidResult = appointmentFormSchema.safeParse({
      ...validInput,
      clientWhatsapp: "not-a-whatsapp",
    })
    expect(invalidResult.success).toBe(false)
  })

  it("rejects invalid date format", () => {
    const invalidResult = appointmentFormSchema.safeParse({
      ...validInput,
      date: "20/08/2026",
    })
    expect(invalidResult.success).toBe(false)
  })
})