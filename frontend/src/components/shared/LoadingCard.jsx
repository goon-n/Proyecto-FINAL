// src/components/shared/LoadingCard.jsx

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const LoadingCard = ({ mensaje = "Cargando..." }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Card className="w-64">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{mensaje}</p>
        </CardContent>
      </Card>
    </div>
  );
};