// src/pages/CompraPage.jsx
import React, { useState } from "react";
import CompraAdd from "../components/compra/CompraAdd";
import CompraList from "../components/compra/CompraList";

export default function CompraPage() {
  const [reload, setReload] = useState(false);

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4">
      <CompraAdd onAdd={()=>setReload(r=>!r)} />
      <CompraList reload={reload} />
    </div>
  );
}
