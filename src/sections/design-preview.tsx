"use client"

export default function DesignPreview() {
  return (
    <div className="p-6 bg-beige-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Design System Preview - Fabi Nails</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-beige-50 rounded-lg">
          <h3 className="font-bold text-beige-600 mb-2">Cores Principais</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="p-2 rounded bg-beige-100">
              <div className="h-6 w-full rounded bg-beige-500"></div>
              <div className="text-xs text-beige-500">Beige-500</div>
            </div>
            <div className="p-2 rounded bg-rose-500">
              <div className="h-6 w-full rounded bg-rose-500"></div>
              <div className="text-xs text-white">Rose-500</div>
            </div>
            <div className="p-2 rounded bg-maroon-500">
              <div className="h-6 w-full rounded bg-maroon-500"></div>
              <div className="text-xs text-white">Maroon-500</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-beige-50 rounded-lg">
          <h3 className="font-bold text-beige-600 mb-2">Tipografia</h3>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-beige-400">text-sm:</span>
              <span className="text-sm text-white">Este é texto small</span>
            </div>
            <div>
              <span className="text-xs text-beige-400">text-base:</span>
              <span className="text-base text-white">Este é o texto base</span>
            </div>
            <div>
              <span className="text-xs text-beige-400">text-xl:</span>
              <span className="text-xl text-white">Este é text-xl</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-beige-50 rounded-lg">
          <h3 className="font-bold text-beige-600 mb-2">Botões</h3>
          <button className="w-full py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
            Botão Primário
          </button>
          <button className="w-full py-3 bg-beige-200 text-beige-700 rounded-lg hover:bg-beige-300 transition-colors">
            Botão Secundário
          </button>
        </div>
      </div>

      <div className="p-4 bg-beige-50 rounded-lg">
        <h3 className="font-bold text-beige-600 mb-2">Input</h3>
        <input
          type="text"
          className="w-full py-3 px-4 rounded-lg bg-white text-beige-900 placeholder-beige-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          placeholder="Nome"
        />
      </div>

      <div className="mt-8 p-4 bg-beige-50 rounded-lg">
        <h3 className="font-bold text-beige-600 mb-2">Componentes</h3>
        <ul className="space-y-2 text-sm">
          <li>Cards com sombra suave e border Beige-200</li>
          <li>Headers com navegação simples</li>
          <li>Footers com endereço e redes</li>
          <li>Carrossel de imagens no portfólio</li>
        </ul>
      </div>
    </div>
  )
}