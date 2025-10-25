import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex gap-4">
      <Link to="/" className="hover:text-blue-300">Inicio</Link>
      <Link to="/clases" className="hover:text-blue-300">Clases</Link>
      <Link to="/socios" className="hover:text-blue-300">Socios</Link>
    </nav>
  );
}
