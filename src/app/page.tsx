"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowUpRight,
  AtSign,
  Calendar,
  Clock,
  Crown,
  Flower2,
  Gem,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";
import { TestimonialsHome } from "@/components/testimonials-home";

const WHATSAPP = "5543996524776";
const WHATSAPP_DISPLAY = "+55 43 99652-4776";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  "Olá, Fabi! Gostaria de agendar um horário na Fabi Nails.",
)}`;

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#portfolio", label: "Portfólio" },
  { href: "#horarios", label: "Horários" },
  { href: "#contato", label: "Contato" },
];

const faqs = [
  {
    q: "Quanto tempo dura o alongamento?",
    a: "Entre 20 e 30 dias com manutenção correta. Usamos gel premium e blindagem que evita descolamento e amarelamento.",
  },
  {
    q: "A manutenção é obrigatória?",
    a: "Recomendamos a cada 20-25 dias para manter simetria, nivelamento e saúde da unha natural.",
  },
  {
    q: "Posso agendar e pagar online?",
    a: "Sim. Você escolhe dia e horário no /booking e confirma na hora. Pagamento via PIX ou presencial.",
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-[#fbf9f6] text-[#1a1716] antialiased selection:bg-[#c38d94] selection:text-[#fbf9f6]">
      {/* Header editorial - anti-slop: sem sombra, borda sutil, backdrop */}
      <header className="sticky top-0 z-40 border-b border-beige-200 bg-[#fbf9f6]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-12">
          <a href="#" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1716] text-[#fbf9f6] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-12">
              <Crown className="h-4 w-4" />
            </span>
            <span className="font-serif text-[22px] tracking-[-0.03em] text-[#1a1716]">
              Fabi
              <span className="font-light italic text-rose-600"> Nails</span>
            </span>
            <span className="hidden text-[10px] leading-none tracking-[0.2em] text-maroon-600 uppercase lg:block">
              — Manoel Ribas · PR
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[11px] font-medium tracking-[0.18em] uppercase text-maroon-800 transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[#1a1716]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              className="hidden items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-maroon-800 transition-colors hover:text-rose-600 sm:flex"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {WHATSAPP_DISPLAY}
            </a>
            <a
              href="/booking"
              className="inline-flex items-center gap-2 rounded-full bg-[#1a1716] px-6 py-2.5 text-xs font-medium tracking-wide text-[#fbf9f6] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#1a1716]/90 hover:gap-3"
            >
              <Calendar className="h-3.5 w-3.5" />
              Agendar
            </a>
          </div>
        </div>
      </header>

      {/* HERO BENTO 7/5 - py-16 mínimo opencode.json:4 */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-12 lg:py-24">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Bloco Editorial - 7 cols */}
          <div className="col-span-12 flex flex-col justify-between rounded-[24px] border border-beige-200 bg-white p-8 lg:col-span-7 lg:p-12 xl:p-14 aspect-auto lg:aspect-[5/4]">
            <div>
              <p className="mb-6 inline-flex items-center gap-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-600">
                <span className="h-px w-8 bg-[#c38d94]/60" />
                Nail designer · Unhas de assinatura
              </p>
              <h1 className="font-serif text-[clamp(2.4rem,5.5vw,4.6rem)] font-light leading-[0.85] tracking-[-0.04em] text-[#1a1716] text-balance">
                Beleza que
                <br />
                <span className="font-normal italic text-rose-600">
                  começa nas
                </span>
                <br />
                pontas dos dedos
              </h1>
              <p className="mt-6 max-w-[38ch] text-[15px] leading-relaxed font-light text-maroon-800">
                Alongamento, manutenção e banho de gel com acabamento
                ultra-fino. 2h de atendimento exclusivo para um resultado
                editorial que dura.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="/booking"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1a1716] px-7 py-3.5 text-sm font-medium tracking-wide text-[#fbf9f6] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#1a1716]/90 hover:tracking-[0.02em]"
              >
                Agendar horário
                <ArrowUpRight className="h-4 w-4 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#servicos"
                className="inline-flex items-center rounded-full border border-beige-300 bg-[#fbf9f6] px-7 py-3.5 text-sm font-medium text-[#1a1716] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-beige-300 hover:bg-white"
              >
                Ver serviços
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-beige-200 pt-8">
              {[
                { v: "3+", l: "anos de experiência" },
                { v: "200+", l: "unhas transformadas" },
                { v: "5.0", l: "avaliação média" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-serif text-2xl font-light tracking-[-0.03em] text-[#1a1716]">
                    {s.v}
                  </p>
                  <p className="text-[11px] tracking-wide text-maroon-600">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bloco Imagem Hero - 5 cols aspect-[4/5] foto real portfolio-1 */}
          <div className="group relative col-span-12 overflow-hidden rounded-[24px] border border-beige-200 bg-white lg:col-span-5 aspect-[4/5] lg:aspect-[4/5]">
            <Image
              src="/images/portfolio/portfolio-1.jpg"
              alt="Unhas alongadas com acabamento premium — trabalho real Fabi Nails"
              width={800}
              height={1000}
              priority
              className="h-full w-full object-cover object-[50%_18%] scale-[1.32] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.38]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1716]/20 via-transparent to-transparent opacity-60" />
            {/* Floating cards sem shadow-2xl, com borda */}
            <div className="absolute left-4 top-4 rounded-2xl border border-beige-200 bg-[#fbf9f6]/90 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-[#c38d94] text-rose-600" />
                <div>
                  <p className="text-xs font-semibold leading-none text-[#1a1716]">
                    5.0 · clientes avaliam
                  </p>
                  <p className="text-[10px] tracking-wide text-maroon-600">
                    atendimento nota máxima
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 rounded-2xl bg-[#1a1716] px-5 py-3.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4a373]">
                Manutenção
              </p>
              <p className="font-serif text-xl font-light text-[#fbf9f6]">
                R$ 100
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker editorial minimal - /polish: tracking-wide + cubic-bezier */}
      <div className="border-y border-beige-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 text-[11px] font-medium tracking-[0.2em] uppercase text-maroon-600 lg:px-12">
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-rose-600" /> Alongamento
          </span>
          <span className="h-3 w-px bg-[#1a1716]/10 max-sm:hidden" />
          <span className="flex items-center gap-2">
            <Flower2 className="h-3.5 w-3.5 text-rose-600" /> Manutenção
          </span>
          <span className="h-3 w-px bg-[#1a1716]/10 max-sm:hidden" />
          <span className="flex items-center gap-2">
            <Gem className="h-3.5 w-3.5 text-rose-600" /> Banho de gel
          </span>
          <span className="h-3 w-px bg-[#1a1716]/10 max-sm:hidden" />
          <span className="hidden lg:flex items-center gap-2 text-[#d4a373]">
            — Produtos premium · Higiene impecável
          </span>
        </div>
      </div>

      {/* BENTO BENEFÍCIOS 5 / 3 / 4 - Quebra do grid 3 iguais */}
      <section
        id="servicos"
        className="mx-auto max-w-[1440px] scroll-mt-24 px-6 py-16 lg:px-12 lg:py-32"
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-600">
              Serviços
            </p>
            <h2 className="font-serif text-4xl font-light tracking-[-0.04em] text-[#1a1716] md:text-5xl">
              Cuidado premium,{" "}
              <span className="italic text-rose-600">sem atalhos</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm font-light leading-relaxed text-maroon-800">
            Técnica editorial, simetria e durabilidade. Cada atendimento dura 2h
            — sem pressa.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Card 1 - 5 cols foto real portfolio-2 - altura fixa igual para os 3, sem crop */}
          <div className="group col-span-12 flex flex-col overflow-hidden rounded-[24px] border border-beige-200 bg-white transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-beige-300 md:col-span-4">
            <div className="relative bg-beige-50 overflow-hidden h-72 flex items-center justify-center">
              <Image
                src="/images/portfolio/portfolio-2.jpg"
                alt="Alongamento — trabalho real Fabi Nails"
                width={800}
                height={600}
                className="w-full h-full object-cover object-[50%_35%] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-1 flex-col p-7 lg:p-8">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#c38d94]/20 bg-[#c38d94]/10 text-rose-600">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="font-serif text-2xl font-light tracking-[-0.02em] text-[#1a1716]">
                Alongamento
              </h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-maroon-800">
                Alongamento em gel com modelagem impecável e acabamento
                duradouro de salão editorial.
              </p>
              <div className="mt-auto flex items-end justify-between border-t border-beige-200 pt-5">
                <div>
                  <p className="text-[11px] tracking-wide text-maroon-600">
                    a partir de
                  </p>
                  <p className="font-serif text-3xl font-light tracking-[-0.03em] text-[#1a1716]">
                    R$ 150
                    <span className="text-base text-maroon-600">,00</span>
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-[#fbf9f6] border border-beige-200 px-3 py-1.5 text-[11px] font-medium text-maroon-800">
                  <Clock className="h-3 w-3" /> 2h
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 - 3 cols foto real portfolio-6 - Manutenção - altura fixa igual para os 3, sem crop */}
          <div className="group col-span-12 flex flex-col overflow-hidden rounded-[24px] border border-beige-200 bg-white transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-beige-300 md:col-span-4">
            <div className="relative bg-beige-50 overflow-hidden h-72 flex items-center justify-center">
              <Image
                src="/images/portfolio/portfolio-6.jpg"
                alt="Manutenção — trabalho real Fabi Nails"
                width={800}
                height={600}
                className="w-full h-full object-cover object-[50%_30%] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-1 flex-col p-7">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#c38d94]/20 bg-[#c38d94]/10 text-rose-600">
                <Flower2 className="h-4 w-4" />
              </span>
              <h3 className="font-serif text-2xl font-light tracking-[-0.02em] text-[#1a1716]">
                Manutenção
              </h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-maroon-800">
                Reestruturação e renovação para manter a beleza sempre em dia.
              </p>
              <div className="mt-auto flex items-end justify-between border-t border-beige-200 pt-5">
                <div>
                  <p className="font-serif text-3xl font-light tracking-[-0.03em] text-[#1a1716]">
                    R$ 100<span className="text-base text-maroon-600">,00</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] tracking-wide text-maroon-600">
                    <Clock className="h-3 w-3" /> 2h · sem correria
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-[#fbf9f6] border border-beige-200 px-3 py-1.5 text-[11px] font-medium text-maroon-800">
                  2h
                </span>
              </div>
            </div>
          </div>

          {/* Card 3 - 4 cols foto real portfolio-3 - altura fixa igual para os 3, sem crop */}
          <div className="group col-span-12 flex flex-col overflow-hidden rounded-[24px] border border-beige-200 bg-white md:col-span-4">
            <div className="relative bg-beige-50 overflow-hidden h-72 flex items-center justify-center">
              <Image
                src="/images/portfolio/portfolio-3.jpg"
                alt="Banho de Gel — trabalho real Fabi Nails"
                width={800}
                height={600}
                className="w-full h-full object-cover object-[50%_25%] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-1 flex-col p-7">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-beige-300 bg-white text-[#1a1716]">
                <Gem className="h-4 w-4" />
              </span>
              <h3 className="font-serif text-2xl font-light tracking-[-0.02em] text-[#1a1716]">
                Banho de Gel
              </h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-maroon-800">
                Brilho intenso e proteção para unhas naturais, finalização
                premium.
              </p>
              <div className="mt-auto flex items-end justify-between border-t border-beige-300 pt-5">
                <p className="font-serif text-3xl font-light tracking-[-0.03em] text-[#1a1716]">
                  R$ 100<span className="text-base text-maroon-600">,00</span>
                </p>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-maroon-800 border border-beige-200">
                  2h
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFÓLIO BENTO 8/4 + 4/8 invertido - assimetria radical */}
      <section
        id="portfolio"
        className="scroll-mt-24 bg-white py-16 lg:py-24 border-y border-beige-200"
      >
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-600">
                Portfólio
              </p>
              <h2 className="font-serif text-4xl font-light tracking-[-0.04em] text-[#1a1716] md:text-5xl">
                Trabalhos que{" "}
                <span className="italic text-rose-600">falam por si</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm font-light leading-relaxed text-maroon-800">
              Unhas que são sua marca pessoal — texturas, tons e acabamentos de
              estúdio.
            </p>
          </div>

          {/* Masonry galeria - fotos inteiras sem crop, alturas variáveis, fundo bege claro */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 lg:gap-6 space-y-4 lg:space-y-6">
            <figure className="group relative break-inside-avoid overflow-hidden rounded-[24px] border border-beige-200 bg-beige-50 mb-4 lg:mb-6">
              <Image
                src="/images/portfolio/portfolio-4.jpg"
                alt="Alongamento em gel — trabalho real"
                width={1200}
                height={700}
                className="w-full h-auto object-contain bg-beige-50 transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1a1716]/60 to-transparent p-4 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                <p className="font-serif text-sm font-light text-[#fbf9f6]">Alongamento em gel — acabamento editorial</p>
                <p className="text-[10px] tracking-[0.15em] uppercase text-[#fbf9f6]/70">Fabi Nails Studio</p>
              </figcaption>
            </figure>
            <figure className="group relative break-inside-avoid overflow-hidden rounded-[24px] border border-beige-200 bg-beige-50 mb-4 lg:mb-6">
              <Image
                src="/images/portfolio/portfolio-5.jpg"
                alt="Finais elegantes — trabalho real"
                width={600}
                height={600}
                className="w-full h-auto object-contain bg-beige-50 transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </figure>
            <figure className="group relative break-inside-avoid overflow-hidden rounded-[24px] border border-beige-200 bg-beige-50 mb-4 lg:mb-6">
              <Image
                src="/images/portfolio/portfolio-6.jpg"
                alt="Tons e texturas — trabalho real"
                width={600}
                height={600}
                className="w-full h-auto object-contain bg-beige-50 transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </figure>
            <figure className="group relative break-inside-avoid overflow-hidden rounded-[24px] border border-beige-200 bg-beige-50 mb-4 lg:mb-6">
              <Image
                src="/images/portfolio/portfolio-7.jpg"
                alt="Modelagem — trabalho real"
                width={600}
                height={600}
                className="w-full h-auto object-contain bg-beige-50 transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </figure>
            <figure className="group relative break-inside-avoid overflow-hidden rounded-[24px] border border-beige-200 bg-beige-50 mb-4 lg:mb-6">
              <Image
                src="/images/portfolio/portfolio-8.jpg"
                alt="Manutenção — trabalho real"
                width={600}
                height={600}
                className="w-full h-auto object-contain bg-beige-50 transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </figure>
            <figure className="group relative break-inside-avoid overflow-hidden rounded-[24px] border border-beige-200 bg-beige-50 mb-4 lg:mb-6">
              <Image
                src="/images/portfolio/portfolio-9.jpg"
                alt="Banho de gel — trabalho real"
                width={600}
                height={600}
                className="w-full h-auto object-contain bg-beige-50 transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </figure>
            <figure className="group relative break-inside-avoid overflow-hidden rounded-[24px] border border-beige-200 bg-beige-50 mb-4 lg:mb-6">
              <Image
                src="/images/portfolio/portfolio-10.jpg"
                alt="Trabalho real — nail art 10"
                width={800}
                height={500}
                className="w-full h-auto object-contain bg-beige-50 transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </figure>
            <figure className="group relative break-inside-avoid overflow-hidden rounded-[24px] border border-beige-200 bg-beige-50">
              <Image
                src="/images/portfolio/portfolio-11.jpg"
                alt="Trabalho real — nail art 11"
                width={800}
                height={500}
                className="w-full h-auto object-contain bg-beige-50 transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </figure>
          </div>
        </div>
      </section>

      <TestimonialsHome />

      {/* Stats estúdio - mantido, não é fake depoimento */}
      <section className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-4 rounded-[24px] border border-beige-200 bg-[#fbf9f6] p-8 text-center lg:flex-row lg:p-10">
          <div className="flex items-center gap-4">
            <p className="font-serif text-5xl font-light tracking-[-0.05em] text-[#1a1716]">
              200<span className="text-rose-600">+</span>
            </p>
            <p className="max-w-[20ch] text-left text-sm font-light leading-snug text-maroon-700">
              unhas transformadas — estúdio próprio, Manoel Ribas · PR
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-maroon-500">
            <Star className="h-4 w-4 fill-[#d4a373] text-[#d4a373]" /> 5.0 · atendimento nota máxima
          </div>
        </div>
      </section>

      {/* HORÁRIOS BENTO 7/5 */}
      <section
        id="horarios"
        className="mx-auto max-w-[1440px] scroll-mt-24 px-6 lg:px-12"
      >
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          <div className="col-span-12 lg:col-span-7 rounded-[24px] border border-beige-200 bg-white p-8 lg:p-10">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-600">
              Horários
            </p>
            <h2 className="font-serif text-4xl font-light tracking-[-0.04em] text-[#1a1716]">
              Encontre o{" "}
              <span className="italic text-rose-600">momento perfeito</span>
            </h2>
            <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-maroon-800">
              Agenda com intervalos de 2h — atendimento inteiro dedicado a você,
              sem correria.
            </p>
            <div className="mt-8 grid gap-3">
              <div className="flex items-center justify-between rounded-2xl border border-beige-200 bg-[#fbf9f6] px-6 py-5 transition-colors duration-500 hover:border-[#c38d94]/20">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-beige-200 text-rose-600">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#1a1716]">
                      Segunda a sexta
                    </p>
                    <p className="text-xs text-maroon-600">dias úteis</p>
                  </div>
                </div>
                <p className="font-serif text-xl font-light text-[#1a1716]">
                  8h – 18h30
                </p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-beige-200 bg-[#fbf9f6] px-6 py-5 transition-colors duration-500 hover:border-[#c38d94]/20">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-beige-200 text-[#1a1716]">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#1a1716]">Sábado</p>
                    <p className="text-xs text-maroon-600">manhã</p>
                  </div>
                </div>
                <p className="font-serif text-xl font-light text-[#1a1716]">
                  8h – 13h
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-12 flex flex-col justify-between rounded-[24px] bg-[#1a1716] p-8 text-[#fbf9f6] lg:col-span-5 lg:p-10 aspect-auto lg:aspect-[4/5]">
            <div>
              <Sparkles className="h-7 w-7 text-[#d4a373]" />
              <h3 className="mt-6 font-serif text-3xl font-light leading-tight tracking-[-0.02em]">
                Quer garantir
                <br />
                seu horário?
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-[#fbf9f6]/60">
                Agende direto pelo site: escolha o dia no calendário e receba
                confirmação na hora.
              </p>
            </div>
            <div className="mt-8">
              <a
                href="/booking"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c38d94] px-6 py-3.5 text-sm font-medium text-white transition-colors duration-500 hover:bg-[#c38d94]/90"
              >
                Agendar pelo site
                <Calendar className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12" />
              </a>
              <div className="mt-6 flex items-center gap-2 border-t border-[#fbf9f6]/10 pt-6 text-sm text-[#fbf9f6]/60">
                <Phone className="h-4 w-4 text-[#d4a373]" />
                {WHATSAPP_DISPLAY}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + CTA FINAL 6/6 */}
      <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-12 lg:py-24">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          <div className="col-span-12 lg:col-span-6 rounded-[24px] border border-beige-200 bg-white p-8 lg:p-10">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-600">
              FAQ
            </p>
            <h2 className="font-serif text-3xl font-light tracking-[-0.04em] text-[#1a1716]">
              Dúvidas frequentes
            </h2>
            <div className="mt-8 divide-y divide-[#1a1716]/5 border-y border-beige-200">
              {faqs.map((f, i) => (
                <button
                  key={f.q}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-start justify-between gap-4 py-6 text-left"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1a1716]">{f.q}</p>
                    <div
                      className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${openFaq === i ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm font-light leading-relaxed text-maroon-800">
                          {f.a}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition-colors duration-500 ${openFaq === i ? "bg-[#1a1716] text-[#fbf9f6] border-[#1a1716]" : "border-beige-300 text-maroon-600"}`}
                  >
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-12 flex flex-col justify-center rounded-[32px] border border-[#c38d94]/20 bg-[#c38d94]/10 p-8 lg:col-span-6 lg:p-12 aspect-auto lg:aspect-[4/3]">
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-600">
              Último convite
            </p>
            <h2 className="mt-3 font-serif text-4xl font-light leading-[0.9] tracking-[-0.04em] text-[#1a1716] lg:text-5xl">
              Pronta para
              <br />
              <span className="italic text-rose-600">unhas de revista?</span>
            </h2>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-maroon-800">
              Atendimento com hora marcada em estúdio próprio. Reserve agora e
              garanta seu horário da semana.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/booking"
                className="inline-flex items-center gap-2 rounded-full bg-[#1a1716] px-7 py-3.5 text-sm font-medium text-[#fbf9f6] transition-colors duration-500 hover:bg-[#1a1716]/90"
              >
                Agendar agora <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-beige-300 bg-white px-7 py-3.5 text-sm font-medium text-[#1a1716] transition-colors hover:border-beige-300"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO BENTO */}
      <section
        id="contato"
        className="mx-auto max-w-[1440px] px-6 pb-8 lg:px-12"
      >
        <div className="rounded-[24px] bg-[#1a1716] p-8 text-[#fbf9f6] lg:p-10">
          <div className="grid grid-cols-12 gap-8 lg:gap-6">
            <div className="col-span-12 lg:col-span-5">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-[#d4a373]">
                Contato
              </p>
              <h2 className="font-serif text-3xl font-light tracking-[-0.03em] lg:text-4xl">
                Vamos cuidar
                <br />
                das suas unhas?
              </h2>
              <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-[#fbf9f6]/60">
                Estúdio próprio, atendimento exclusivo e higiene impecável.
              </p>
            </div>
            <div className="col-span-12 grid gap-3 lg:col-span-7 lg:grid-cols-1">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                className="group flex items-center gap-4 rounded-2xl border border-[#fbf9f6]/10 bg-[#fbf9f6]/5 px-6 py-5 transition-colors duration-500 hover:border-[#c38d94]/30 hover:bg-[#fbf9f6]/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c38d94]/20 text-rose-600 transition-transform duration-500 group-hover:scale-110">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[#fbf9f6]/40">
                    WhatsApp
                  </p>
                  <p className="text-sm font-medium text-[#fbf9f6]">
                    {WHATSAPP_DISPLAY}
                  </p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 text-[#fbf9f6]/20 transition-colors group-hover:text-[#fbf9f6]/60" />
              </a>
              <div className="flex items-center gap-4 rounded-2xl border border-[#fbf9f6]/10 bg-[#fbf9f6]/5 px-6 py-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbf9f6]/5 text-[#d4a373]">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[#fbf9f6]/40">
                    Estúdio próprio
                  </p>
                  <p className="text-sm font-medium text-[#fbf9f6]">
                    Atendimento com hora marcada · Manoel Ribas
                  </p>
                </div>
              </div>
              <a
                href="https://www.instagram.com/fabi_naildesign22"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-[#fbf9f6]/10 bg-[#fbf9f6]/5 px-6 py-5 transition-colors duration-500 hover:border-[#c38d94]/30 hover:bg-[#fbf9f6]/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c38d94]/20 text-rose-600 transition-transform duration-500 group-hover:scale-110">
                  <AtSign className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-[#fbf9f6]/40">
                    Instagram
                  </p>
                  <p className="text-sm font-medium text-[#fbf9f6]">
                    @fabi_naildesign22
                  </p>
                </div>
                <ArrowUpRight className="ml-auto h-4 w-4 text-[#fbf9f6]/20 transition-colors group-hover:text-[#fbf9f6]/60" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER 5/3/4 assimétrico */}
      <footer className="border-t border-beige-200 bg-[#fbf9f6] py-12">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1716] text-[#fbf9f6]">
                  <Crown className="h-4 w-4" />
                </span>
                <span className="font-serif text-xl tracking-[-0.02em] text-[#1a1716]">
                  Fabi
                  <span className="italic font-light text-rose-600">
                    {" "}
                    Nails
                  </span>
                </span>
              </div>
              <p className="mt-3 max-w-xs text-xs font-light leading-relaxed text-maroon-600">
                Estúdio de unhas premium em Manoel Ribas. Alongamento,
                manutenção e banho de gel.
              </p>
            </div>
            <div className="col-span-6 lg:col-span-3">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-maroon-500">
                Navegação
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-sm font-light text-maroon-800 transition-colors hover:text-[#1a1716]"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="col-span-6 lg:col-span-4 lg:text-right">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-maroon-500">
                Agendamentos
              </p>
              <a
                href={WHATSAPP_URL}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#1a1716] hover:text-rose-600 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> {WHATSAPP_DISPLAY}
              </a>
              <p className="mt-6 text-xs font-light text-maroon-500">
                © {new Date().getFullYear()} Fabi Nails — design de unhas
                premium
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
