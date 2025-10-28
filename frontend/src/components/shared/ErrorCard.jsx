// src/components/shared/ErrorCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ErrorCard = ({ mensaje, onVolver, textoBoton = "Volver" }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{mensaje}</p>
          {onVolver && (
            <Button onClick={onVolver} className="mt-4">
              {textoBoton}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};