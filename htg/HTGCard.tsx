'use client';

import { differenceInDays, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, AlertCircle, Clock, DollarSign, Phone, Send } from 'lucide-react';
import type { Invoice, Fine } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '../ui/button';

interface HTGCardProps {
  invoice: Invoice;
  onSendReminder: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
}

export function HTGCard({ invoice, onSendReminder, onRecordPayment }: HTGCardProps) {
  const dueDate = invoice.rentPeriod.endDate.toDate();
  const daysUntilDue = differenceInDays(dueDate, new Date());
  const isOverdue = daysUntilDue < 0;
  const isWarning = daysUntilDue <= 2 && daysUntilDue >= 0;

  const getStatusConfig = () => {
    if ((invoice.financial?.remainingBalance || 0) <= 0) return { color: 'bg-green-100 text-green-700', label: 'Lunas', icon: CheckCircle };
    if (isOverdue) return { color: 'bg-red-100 text-red-700', label: `Terlambat ${Math.abs(daysUntilDue)} hari`, icon: AlertCircle };
    if (isWarning) return { color: 'bg-yellow-100 text-yellow-700', label: `Jatuh tempo ${daysUntilDue + 1} hari lagi`, icon: Clock };
    return { color: 'bg-gray-100 text-gray-700', label: 'Pending', icon: DollarSign };
  };

  const config = getStatusConfig();

  const htgItems: { description: string, amount: number }[] = [];
  const remainingBalance = invoice.financial?.remainingBalance || 0;
  const finesTotal = invoice.financial?.finesTotal || 0;
  
  if (remainingBalance > 0) {
      const remainingRentalCost = remainingBalance - finesTotal;
      if (remainingRentalCost > 0) {
        htgItems.push({
            description: "Sisa sewa & biaya lain",
            amount: remainingRentalCost
        });
      }
  }
  (invoice.fines || []).forEach((fine: Fine) => {
      htgItems.push({
          description: `Denda: ${fine.notes}`,
          amount: fine.amount
      });
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 ${
      isOverdue ? 'border-red-500' : isWarning ? 'border-yellow-500' : 'border-gray-300'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Customer Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
              <config.icon className="w-3 h-3 inline mr-1" />
              {config.label}
            </span>
            <span className="text-sm text-gray-500">#{invoice.invoiceNumber}</span>
          </div>
          
          <h4 className="font-bold text-lg">{invoice.customerSnapshot.name}</h4>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {invoice.customerSnapshot.phone}
            </span>
            <span>•</span>
            <span>Jatuh tempo: {format(dueDate, 'dd MMM yyyy', { locale: id })}</span>
          </div>
        </div>

        {/* Center: Details */}
        {htgItems.length > 0 && (
          <div className="flex-1 bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Rincian Sisa Tagihan:</p>
            {htgItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.description}</span>
                <span>{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Right: Amount & Actions */}
        <div className="text-right min-w-[200px]">
          <p className="text-3xl font-bold text-red-600">{formatCurrency(invoice.financial.remainingBalance)}</p>
          <p className="text-sm text-gray-500">
            Dibayar: {formatCurrency(invoice.financial.paidAmount)} / {formatCurrency(invoice.financial.grandTotal)}
          </p>
          
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendReminder(invoice)}
              className="flex-1"
            >
              <Send className="w-4 h-4" />
              Reminder
            </Button>
            <Button
              size="sm"
              onClick={() => onRecordPayment(invoice)}
              className="flex-1"
            >
              Bayar
            </Button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {invoice.payments?.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Riwayat Pembayaran:</p>
          <div className="space-y-2">
            {invoice.payments.map((payment, idx) => (
              <div key={idx} className="flex justify-between text-sm p-2 bg-green-50 rounded">
                <span>{format(payment.createdAt.toDate(), 'dd MMM yyyy HH:mm')} - {payment.method}</span>
                <span className="font-medium text-green-700">{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
