'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map } from "lucide-react";

export default function GpsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pelacakan GPS</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Map /> Peta Pelacakan Unit</CardTitle>
          <CardDescription>
            Halaman ini akan menampilkan peta live untuk melacak posisi semua unit yang dilengkapi GPS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Komponen Peta akan ditampilkan di sini.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
