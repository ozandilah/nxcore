import React from 'react';
import { Package, QrCode, X } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination';
import { ScannedItem } from '@/features/production-sewing/types';
interface ScannedItemsCardProps {
  items: ScannedItem[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string, qty: number) => void;
  onSubmit: () => void;
  isSubmitted: boolean;
  removingItemId: string | null;
}

export const ScannedItemsCard = ({
  items,
  currentPage,
  itemsPerPage,
  onPageChange,
  onDelete,
  onSubmit,
  isSubmitted,
  removingItemId
}: ScannedItemsCardProps) => {
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  return (
    <Card className="border shadow-md flex flex-col h-[500px] md:h-[550px] lg:h-[600px]">
      <CardHeader className="border-b bg-muted/30 py-3 md:py-4 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg font-bold">
            <Package className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Scanned Items
          </CardTitle>
          <Badge variant="secondary" className="text-xs text-white px-2 md:px-3 py-0.5 md:py-1 font-semibold shrink-0 bg-orange-400 hover:bg-orange-400">
            {items.length} items
          </Badge>
        </div>
      </CardHeader>
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-8 md:py-12">
            <QrCode className="h-16 md:h-20 w-16 md:w-20 mb-3 md:mb-4 opacity-20" />
            <p className="text-sm md:text-base font-medium">No items scanned</p>
            <p className="text-xs md:text-sm mt-1 md:mt-2">Click scan button to add items</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto min-h-0">
              <div className="w-full">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-orange-400 sticky top-0 z-10">
                    <tr className="border-b">
                      <th className="px-2 md:px-3 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold uppercase text-white">No</th>
                      <th className="px-2 md:px-3 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold uppercase text-white">Barcode</th>
                      <th className="px-2 md:px-3 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold uppercase text-white hidden sm:table-cell">PO</th>
                      <th className="px-2 md:px-3 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold uppercase text-white hidden lg:table-cell">Article</th>
                      <th className="px-2 md:px-3 py-2 md:py-3 text-left text-[10px] md:text-xs font-semibold uppercase text-white">Size</th>
                      <th className="px-2 md:px-3 py-2 md:py-3 text-right text-[10px] md:text-xs font-semibold uppercase text-white">Qty</th>
                      <th className="px-2 md:px-3 py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold uppercase text-white w-16 md:w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={`border-b hover:bg-muted/30 transition-all duration-300 ${
                          removingItemId === item.id 
                            ? 'opacity-0 scale-95 bg-destructive/10' 
                            : 'opacity-100 scale-100'
                        }`}
                      >
                        <td className="px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm">{startIndex + index + 1}</td>
                        <td className="px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm font-mono">{item.barcodeUpc}</td>
                        <td className="px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm hidden sm:table-cell">{item.po}</td>
                        <td className="px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm font-medium hidden lg:table-cell">{item.article}</td>
                        <td className="px-2 md:px-3 py-2 md:py-3">
                          <Badge variant="outline" className="font-semibold text-[10px] md:text-xs px-1.5 md:px-2 py-0 md:py-0.5">
                            {item.size}
                          </Badge>
                        </td>
                        <td className="px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm text-right font-semibold">{item.qty}</td>
                        <td className="px-2 md:px-3 py-2 md:py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(item.id, item.qty)}
                            disabled={removingItemId === item.id}
                            className="h-7 w-7 md:h-8 md:w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-white disabled:opacity-50"
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4 " />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Footer with Pagination and Actions */}
            <div className="border-t p-3 md:p-4 shrink-0 bg-muted/20">
               <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-10 px-4 text-sm font-semibold hidden md:flex">
                    (F1) Help
                  </Button>
                  <Button
                    onClick={onSubmit}
                    className="h-10 px-8 bg-orange-400 hover:bg-orange-400 text-primary-foreground text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    Submit
                  </Button>
                </div>

                <div className="flex items-center justify-center">
                  {totalPages > 1 && (
                    <Pagination className="mx-0 w-auto">
                      <PaginationContent className="gap-1">
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                            className={`h-9 text-sm ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                          />
                        </PaginationItem>
                        {/* Simplified pagination logic for brevity */}
                        <PaginationItem>
                            <span className="px-4 text-sm">Page {currentPage} of {totalPages}</span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                            className={`h-9 text-sm ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>

                <div className="flex items-center justify-end">
                  <Badge 
                    variant={isSubmitted ? "default" : "secondary"}
                    className={`text-sm px-4 py-1.5 font-semibold shrink-0 ${
                      isSubmitted 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-orange-400 hover:bg-orange-400 text-white'
                    }`}
                  >
                    {isSubmitted ? 'Complete' : 'Draft'}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};