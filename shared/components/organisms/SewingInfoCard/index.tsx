import React from 'react';
import { QrCode, Scan } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

interface SewingInfoCardProps {
  tenant: string;
  organization: string;
  documentNo: string;
  planLine: string;
  onPlanLineChange: (val: string) => void;
  planLineOptions?: string[];
  poNumber: string;
  onPoNumberChange: (val: string) => void;
  poNumberOptions?: string[];
  isLoadingPO?: boolean;
  onScanClick: () => void;
}

export const SewingInfoCard = ({
  tenant,
  organization,
  documentNo,
  planLine,
  onPlanLineChange,
  planLineOptions,
  poNumber,
  onPoNumberChange,
  poNumberOptions,
  isLoadingPO,
  onScanClick
}: SewingInfoCardProps) => {
  return (
    <Card className="border shadow-md h-fit">
      <CardHeader className="border-b bg-muted/30 py-3 md:py-4 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg font-bold">
          <QrCode className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Sewing Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 p-3 md:p-4 lg:p-5">
        {/* Tenant & Organization */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] md:text-xs text-muted-foreground uppercase">Tenant</Label>
            <div className="px-2.5 md:px-3 py-2 md:py-2.5 bg-muted/50 rounded-md text-xs md:text-sm font-medium border whitespace-nowrap overflow-hidden text-ellipsis">
              {tenant}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] md:text-xs text-muted-foreground uppercase">Organization</Label>
            <div className="px-2.5 md:px-3 py-2 md:py-2.5 bg-muted/50 rounded-md text-xs md:text-sm font-medium border whitespace-nowrap overflow-hidden text-ellipsis">
              {organization}
            </div>
          </div>
        </div>

        {/* Plan Line */}
        <div className="space-y-1.5">
          <Label htmlFor="planLine" className="text-xs md:text-sm font-semibold">
            Plan Line
          </Label>
          {planLineOptions && planLineOptions.length > 0 ? (
            <select
              id="planLine"
              value={planLine}
              onChange={(e) => onPlanLineChange(e.target.value)}
              className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-xs md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Select plan line</option>
              {planLineOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <Input
              id="planLine"
              value={planLine}
              onChange={(e) => onPlanLineChange(e.target.value)}
              className="h-10 md:h-11 text-xs md:text-sm"
              placeholder="Enter plan line"
            />
          )}
        </div>

        {/* Document No */}
        <div className="space-y-1.5">
          <Label className="text-[10px] md:text-xs text-muted-foreground uppercase">Document No</Label>
          <div className="px-2.5 md:px-3 py-2 md:py-2.5 bg-muted/50 rounded-md text-xs md:text-sm font-medium border">
            {documentNo}
          </div>
        </div>

        {/* PO Number */}
        <div className="space-y-1.5">
          <Label htmlFor="poNumber" className="text-xs md:text-sm font-semibold">
            PO #
          </Label>
          {poNumberOptions && poNumberOptions.length > 0 ? (
            <select
              id="poNumber"
              value={poNumber}
              onChange={(e) => onPoNumberChange(e.target.value)}
              disabled={isLoadingPO}
              className="flex h-10 md:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-xs md:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>
                {isLoadingPO ? 'Loading PO...' : 'Select PO number'}
              </option>
              {poNumberOptions.map((po) => (
                <option key={po} value={po}>{po}</option>
              ))}
            </select>
          ) : (
            <Input
              id="poNumber"
              value={poNumber}
              onChange={(e) => onPoNumberChange(e.target.value)}
              className="h-10 md:h-11 text-xs md:text-sm"
              placeholder={isLoadingPO ? 'Loading...' : 'Enter PO number'}
              disabled={isLoadingPO}
            />
          )}
        </div>

        {/* Scan Button */}
        <Button
          onClick={onScanClick}
          className="w-full h-11 md:h-12 bg-orange-400 hover:bg-orange-500 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all text-sm"
        >
          <Scan className="mr-2 h-4 w-4 md:h-5 md:w-5" />
          Scan Barcode
        </Button>
      </CardContent>
    </Card>
  );
};