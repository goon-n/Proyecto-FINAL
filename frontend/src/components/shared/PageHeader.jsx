// src/components/shared/PageHeader.jsx

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const PageHeader = ({
  icon: Icon,
  titulo,
  descripcion,
  onVolver,
  textoBoton = "Volver",
  children // << agregar esto aquí
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-8 w-8 text-primary" />}
            <div>
              <CardTitle className="text-3xl">{titulo}</CardTitle>
              {descripcion && (
                <CardDescription className="text-lg mt-1">
                  {descripcion}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onVolver && (
              <Button onClick={onVolver} variant="outline" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {textoBoton}
              </Button>
            )}
            {children}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
