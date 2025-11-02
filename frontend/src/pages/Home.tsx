export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center bg-gradient-to-b from-emerald-50 to-white animate-fadeIn">
      <h1 className="text-5xl font-extrabold mb-6 text-emerald-700 drop-shadow-sm">
        🌿 Bienvenido a <span className="text-amber-600">Alquimia</span>
      </h1>
      <p className="text-lg text-gray-700 max-w-xl leading-relaxed">
        Proyecto de desarrollo sostenible. Gestiona a tus{" "}
        <span className="font-semibold text-emerald-600">alquimistas</span>, sus{" "}
        <span className="font-semibold text-amber-600">rangos</span> y{" "}
        <span className="font-semibold text-emerald-600">especialidades</span> en una experiencia interactiva.
      </p>

      <div className="mt-10">
        <a
          href="/alquimistas"
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300"
        >
          Entrar al Laboratorio
        </a>
      </div>
    </div>
  );
}
