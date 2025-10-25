import { useEffect, useState } from "react";
import api from "../api/api";

export default function Clases() {
  const [clases, setClases] = useState([]);

  useEffect(() => {

    api.listarClases().then((data) => setClases(data));
  }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Listado de Clases</h1>
      <ul className="space-y-2">
        {clases.map((clase) => (
          <li key={clase.id} className="p-4 bg-gray-800 rounded shadow">
            {clase.nombre}
          </li>
        ))}
      </ul>
    </div>
  );
}
