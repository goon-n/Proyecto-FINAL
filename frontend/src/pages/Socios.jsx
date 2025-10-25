import { useEffect, useState } from "react";
import api from "../api/api"; 

export default function Socios() {
  const [socios, setSocios] = useState([]);

  useEffect(() => {
    api.listarSocios().then(data => setSocios(data));
  }, []);

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Socios</h1>
      <ul className="space-y-2">
        {socios.map((socio) => (
          <li key={socio.id} className="p-4 bg-gray-800 rounded shadow">
            {socio.username}
          </li>
        ))}
      </ul>
    </div>
  );
}
