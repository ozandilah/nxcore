import React, { useState, useMemo } from 'react';
import { X, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { BarcodeDetail } from '@/features/production-sewing/types';

interface BarcodeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planLine: string;
  poNumber: string;
  barcodeList: BarcodeDetail[];
  onSelect: (barcode: BarcodeDetail) => void;
}

export const BarcodeSelectionModal = ({
  isOpen,
  onClose,
  planLine,
  poNumber,
  barcodeList,
  onSelect
}: BarcodeSelectionModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Calculate unique sizes internally
  const uniqueSizes = useMemo(() => 
    Array.from(new Set(barcodeList.map(b => b.size))), 
  [barcodeList]);

  // Filter logic internal to modal
  const filteredBarcodes = selectedSize 
    ? barcodeList.filter(b => b.size === selectedSize)
    : barcodeList;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-0 sm:p-3 md:p-4 overflow-y-auto sm:overflow-hidden">
      <Card className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl min-h-screen sm:min-h-0 sm:max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-300">
        <CardHeader className="border-b bg-primary/5 dark:bg-primary/10 shrink-0 p-4 md:p-5 lg:p-6">
          <div className="flex items-start md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold">Sewing</CardTitle>
              <CardDescription className="mt-1.5 md:mt-2">
                <div className="flex flex-col gap-1 text-xs md:text-sm">
                  <span className="truncate"><strong>Plan Line:</strong> {planLine}</span>
                  <span className="truncate"><strong>PO #:</strong> {poNumber}</span>
                </div>
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 h-9 w-9 md:h-10 md:w-10">
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
          <div className="space-y-4 md:space-y-5 lg:space-y-6">
            {/* Size Filter */}
            <div className="space-y-2.5 md:space-y-3">
              <Label className="text-sm md:text-base lg:text-lg font-semibold block">
                List Size ({uniqueSizes.length} sizes available)
              </Label>
              <div className="w-full overflow-x-auto pb-2">
                <div className="flex flex-wrap gap-2 md:gap-2.5 min-w-max sm:min-w-0">
                  {uniqueSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className="h-9 md:h-10 lg:h-11 px-4 md:px-5 lg:px-6 text-sm md:text-base font-semibold whitespace-nowrap transition-all duration-200 shrink-0"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Barcode List */}
            <div className="space-y-2.5 md:space-y-3">
              <Label className="text-sm md:text-base lg:text-lg font-semibold block">
                List Barcode ({filteredBarcodes.length} items)
              </Label>
              <div className="border rounded-lg bg-muted/10 overflow-hidden">
                <div className="max-h-[calc(100vh-420px)] sm:max-h-[450px] md:max-h-[500px] lg:max-h-[550px] overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 p-3 md:p-4">
                    {filteredBarcodes.map((barcode, index) => (
                      <button
                        key={index}
                        onClick={() => {
                            onSelect(barcode);
                            setSelectedSize(null); // Reset filter on select if desired
                        }}
                        className="group relative flex flex-col gap-3 p-3.5 md:p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200 bg-card active:scale-[0.98] text-left"
                      >
                        <div className="flex gap-3 items-start w-full">
                          <div className="h-14 w-14 md:h-16 md:w-16 lg:h-[72px] lg:w-[72px] shrink-0 bg-muted rounded-md flex items-center justify-center border group-hover:border-primary transition-colors">
                            <QrCode className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 text-muted-foreground/40" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-bold text-sm md:text-base px-2 md:px-2.5 h-6 md:h-7 min-w-8 justify-center">
                                  {barcode.size}
                                </Badge>
                                <span className="text-sm md:text-base font-bold text-muted-foreground">x{barcode.qty}</span>
                              </div>
                            </div>
                            <p className="text-sm md:text-base font-semibold truncate text-foreground">{barcode.item}</p>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">{barcode.barcode}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <div className="border-t p-4 md:p-5 bg-muted/30 shrink-0 flex justify-end">
            <Button variant="outline" onClick={onClose} className="h-10 md:h-11 px-6 md:px-8 text-sm md:text-base font-semibold">
                Close
            </Button>
        </div>
      </Card>
    </div>
  );
};