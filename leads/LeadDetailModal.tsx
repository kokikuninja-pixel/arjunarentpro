
'use client';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CustomerRiskBadge } from "../customers/customer-risk-badge";
import { User, Phone, MapPin, Bike, Calendar, Info, HelpCircle, MessageSquare, Briefcase } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | number | null }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <Icon className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

export function LeadDetailModal({ lead, isOpen, onClose }: LeadDetailModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  if (!lead) return null;

  const handleCreateInvoice = () => {
    if (!lead.branchId) {
      toast({
        variant: "destructive",
        title: "Gagal Membuat Invoice",
        description: "Lead ini tidak terasosiasi dengan cabang manapun.",
      });
      return;
    }
    router.push(`/${lead.branchId}/invoices/new?leadId=${lead.id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Detail Lead: {lead.nama}
             <Badge variant="outline">{lead.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Tinjau informasi yang dikirimkan oleh calon penyewa.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
            <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="font-semibold">Skor Risiko</span>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{lead.riskScore || 0}</p>
                        <CustomerRiskBadge riskLevel={lead.riskLevel} />
                    </div>
                </div>

                <Separator />
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem icon={User} label="Nama Lengkap" value={lead.nama} />
                    <DetailItem icon={Phone} label="Nomor Telepon" value={lead.phone} />
                    <DetailItem icon={MapPin} label="Kota Asal (KTP)" value={lead.kotaAsalKTP} />
                    <DetailItem icon={MapPin} label="Domisili Tinggal" value={lead.domisiliTinggal} />
                    {lead.domisiliKerja && <DetailItem icon={Briefcase} label="Domisili Kerja" value={lead.domisiliKerja} />}
                    <DetailItem icon={HelpCircle} label="Sumber Info" value={lead.sumberInfo} />
                </div>
                
                <Separator />

                <div className="space-y-3">
                    <DetailItem icon={Bike} label="Request Motor" value={lead.requestMotor} />
                    <DetailItem icon={Calendar} label="Rencana Sewa" value={lead.rencanaSewa} />
                    <DetailItem icon={MessageSquare} label="Tujuan Penggunaan" value={lead.tujuanPenggunaan} />
                </div>

            </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button onClick={handleCreateInvoice} disabled={!lead.branchId}>Konversi ke Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
