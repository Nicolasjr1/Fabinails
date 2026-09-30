# Design System - Fabi Nails

## Cores (Colors)

### Beige (fundo principal)
- **Beige-50**: `#FAF9F5` - fundo claro
- **Beige-100**: `#F5F0E8` - superfície clara
- **Beige-200**: `#E4DED5` - border/dividers
- **Beige-300**: `#D1CDBF` - hover states
- **Beige-400**: `#BDA892` - texto secundário
- **Beige-500**: `#A8957A` - texto em destaque
- **Beige-600**: `#85725A` - hover/ativo
- **Beige-700**: `#625042` - texto em parágrafos
- **Beige-800**: `#3F322A` - texto forte
- **Beige-900**: `#2C2520` - fundo alternado

### Rosa claro (detalhes femininos)
- **Rose-50**: `#FFF1F2` - feedback positivo
- **Rose-100**: `#FFE4E6` - hover de links
- **Rose-200**: `#FCC2C7` - destaque suave
- **Rose-300**: `#FAA2B5` - botões ativos
- **Rose-400**: `#F8839F` - hover de botões
- **Rose-500**: `#F46B8C` - cor principal de ação
- **Rose-600**: `#EB5078` - estado pressionado
- **Rose-700**: `#E23F6D` - disabled/ativo
- **Rose-800**: `#D03560` - sombreado
- **Rose-900**: `#A82951` - texto em rosa escuro

### Marron (elementos de destaque)
- **Maroon-50**: `#F5F0F5` - backgrounds leves
- **Maroon-100**: `#E8E4E9` - borders
- **Maroon-200**: `#D0C8D3` - separadores
- **Maroon-300**: `#B8ADC4` - texto secundário marrom
- **Maroon-400**: `#A090AB` - hover de elementos marrom
- **Maroon-500**: `#887895` - texto em marrom
- **Maroon-600**: `#70627D` - estado ativo
- **Maroon-700**: `#584C66` - texto forte
- **Maroon-800**: `#40364E` - fundo de seções
- **Maroon-900**: `#282030` - profundo

## Tipografia

### Fontes
- **Família display**: `Georgia, serif` - usada em títulos e destaques
- **Família body**: `Inter, sans-serif` - usada em conteúdo geral

### Escala tipográfica
- `text-xs`: 0.75rem (12px) - labels e metadados
- `text-sm`: 0.875rem (14px) - texto pequeno
- `text-base`: 1rem (16px) - corpo do texto
- `text-lg`: 1.125rem (18px) - grandes textos
- `text-xl`: 1.25rem (20px) - títulos de seção
- `text-2xl`: 1.5rem (24px) - títulos de página
- `text-3xl`: 1.875rem (30px) - títulos principais
- `text-4xl`: 2.25rem (36px) - headings destacados

## Espaçamento

### Escala de espaçamento (base 4px)
- `px`: 1px
- `0.5`: 2px
- `1`: 4px
- `1.5`: 6px
- `2`: 8px
- `2.5`: 10px
- `3`: 12px
- `4`: 16px
- `5`: 20px
- `6`: 24px
- `8`: 32px

## Rádiulos de Borda

- `sm`: 8px - inputs e elementos menores
- `md`: 12px - cards e componentes
- `lg`: 16px - cards maiores
- `full`: 9999px - avatares, círculos

## Componentes Base

### Botões
- **Primary**: Fundo Rose-500, texto branco, hover Rose-600
- **Secondary**: Fundo Beige-50, texto Beige-700, hover Beige-400
- **Danger/Aviso**: Fundo Rose-100, texto Rose-600
- **Fantasia**: Borda marrom, fundo transparente

### Campos de input
- Fundo Branco
- Borda Beige-300
- Foco: Borda Rose-500
- Texto: Beige-900

### Cartões
- Fundo Branco (ou Beige-50)
- Borda: Beige-200
- Raio: lg (16px)
- Sombra: suave (0 2px 4px rgba(0,0,0,0.05))

## Layout Global

- **Background**: Beige-50 em todo o site
- **Max width**: 800px para área de conteúdo, 1200px para homepage
- **Spacing**: Consistente usando a escala 4px
- **Header**: Navbar simples com logo e links
- **Footer**: Informações de contato, endereço, direitos autorais

## Páginas/Seções

1. **Homepage**: Hero + serviços + portfólio + localização + CTA WhatsApp
2. **Booking**: Formulário de agendamento com validação
3. **Admin Area**: Login + agenda
4. **Portfolio**: Galeria de imagens
5. **Contact**: Endereço + mapa do Google Maps