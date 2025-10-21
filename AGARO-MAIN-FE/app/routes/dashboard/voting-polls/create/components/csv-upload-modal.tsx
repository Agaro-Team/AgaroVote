/**
 * CSV Upload Modal Component
 *
 * Modal for bulk uploading wallet addresses via CSV file.
 * Features:
 * - Template download
 * - Drag-and-drop file upload
 * - CSV validation with preview
 * - Duplicate detection (within CSV and against existing addresses)
 * - Ethereum address validation
 * - Async upload handling for large datasets
 * - Browser navigation protection during processing/uploading
 * - Visual feedback for processing and uploading states
 * - Modal close protection while operations are in progress
 */
import { AlertCircle, CheckCircle, Download, Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type { CSVParseResult } from '~/lib/csv-utils';
import { downloadAddressTemplate, parseAddressesCSV } from '~/lib/csv-utils';
import { cn } from '~/lib/utils';

import { useCallback, useEffect, useState } from 'react';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (addresses: string[]) => void | Promise<void>;
  existingAddresses?: string[];
}

export function CSVUploadModal({
  isOpen,
  onClose,
  onUpload,
  existingAddresses = [],
}: CSVUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Prevent user from leaving page while processing or uploading
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing || isUploading) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
        return '';
      }
    };

    if (isProcessing || isUploading) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isProcessing, isUploading]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadedFile = acceptedFiles[0];
      if (!uploadedFile) return;

      setFile(uploadedFile);
      setIsProcessing(true);

      try {
        const result = await parseAddressesCSV(uploadedFile);

        // Check for duplicates with existing addresses
        const existingSet = new Set(existingAddresses.map((addr) => addr.toLowerCase()));
        const duplicatesWithExisting: string[] = [];
        const newValidAddresses: string[] = [];

        result.validAddresses.forEach((addr) => {
          if (existingSet.has(addr.toLowerCase())) {
            duplicatesWithExisting.push(addr);
          } else {
            newValidAddresses.push(addr);
          }
        });

        setParseResult({
          ...result,
          validAddresses: newValidAddresses,
          duplicates: [...result.duplicates, ...duplicatesWithExisting],
        });
      } catch (error) {
        setParseResult({
          validAddresses: [],
          invalidAddresses: [],
          duplicates: [],
          totalRows: 0,
          isValid: false,
          error: 'Failed to process file',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [existingAddresses]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024, // 1MB
  });

  const handleUpload = async () => {
    if (!parseResult || parseResult.validAddresses.length === 0) return;

    setIsUploading(true);
    try {
      await onUpload(parseResult.validAddresses);
      handleClose();
    } catch (error) {
      console.error('Error uploading addresses:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    // Prevent closing while processing or uploading
    if (isProcessing || isUploading) {
      return;
    }

    setFile(null);
    setParseResult(null);
    setIsProcessing(false);
    setIsUploading(false);
    onClose();
  };

  const hasValidAddresses = parseResult && parseResult.validAddresses.length > 0;
  const isDisabled = isProcessing || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Upload Addresses using CSV</DialogTitle>
          <DialogDescription>
            Import multiple wallet addresses at once using a CSV file. Download the template below
            to see the required format.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh]">
          <div className="space-y-4 pr-4 pb-4">
            {/* Template Download Button */}
            <div className="flex justify-start">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadAddressTemplate}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            {/* Dropzone Area */}
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50',
                isDisabled && 'opacity-50 pointer-events-none'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-sm text-muted-foreground">Drop the CSV file here...</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      Drag and drop your CSV file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Maximum file size: 1MB | Maximum rows: 10,000
                    </p>
                  </>
                )}
                {file && (
                  <div className="mt-2 text-sm text-primary flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {file.name}
                  </div>
                )}
              </div>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="text-center text-sm text-muted-foreground animate-pulse">
                Processing CSV file...
              </div>
            )}

            {/* Uploading State */}
            {isUploading && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                <div>
                  <p className="text-sm font-medium text-primary">Uploading addresses...</p>
                  <p className="text-xs text-muted-foreground">
                    {parseResult && parseResult.validAddresses.length > 100
                      ? 'Processing large dataset in batches for optimal performance'
                      : 'This will only take a moment'}
                  </p>
                </div>
              </div>
            )}

            {/* Parse Error */}
            {parseResult?.error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/90">{parseResult.error}</p>
                </div>
              </div>
            )}

            {/* Success Summary */}
            {parseResult && !parseResult.error && (
              <div className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {parseResult.validAddresses.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Valid Addresses</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {parseResult.invalidAddresses.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Invalid Addresses</div>
                  </div>
                </div>

                {/* Duplicates Info */}
                {parseResult.duplicates.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">
                          {parseResult.duplicates.length} duplicate(s) removed
                        </span>
                        <p className="text-muted-foreground text-xs mt-1">
                          Duplicates within CSV or already existing in the form were automatically
                          removed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invalid Addresses Preview */}
                {parseResult.invalidAddresses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-destructive">
                      Invalid Addresses ({parseResult.invalidAddresses.length})
                    </h4>
                    <ScrollArea className="h-48 border rounded-lg">
                      <Table className="w-full text-xs">
                        <TableHeader className="bg-muted sticky top-0">
                          <TableRow>
                            <TableHead>Line</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parseResult.invalidAddresses.slice(0, 50).map((item, index) => (
                            <TableRow key={index} className="border-t">
                              <TableCell className="p-2 text-muted-foreground">
                                {item.lineNumber}
                              </TableCell>
                              <TableCell className="p-2 font-mono break-all">
                                {item.address || '(empty)'}
                              </TableCell>
                              <TableCell className="p-2 text-destructive">{item.error}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {parseResult.invalidAddresses.length > 50 && (
                        <div className="p-2 text-center text-xs text-muted-foreground border-t">
                          ... and {parseResult.invalidAddresses.length - 50} more
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                )}

                {/* Valid Addresses Preview */}
                {parseResult.validAddresses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
                      Valid Addresses ({parseResult.validAddresses.length}) - Preview
                    </h4>
                    <ScrollArea className="h-48 border rounded-lg">
                      <Table className="w-full text-xs">
                        <TableHeader className="bg-muted sticky top-0">
                          <TableRow>
                            <TableHead>Line</TableHead>
                            <TableHead>Address</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parseResult.validAddresses.slice(0, 10).map((address, index) => (
                            <TableRow key={index} className="border-t">
                              <TableCell className="p-2 text-muted-foreground">
                                {index + 1}
                              </TableCell>
                              <TableCell className="p-2 font-mono break-all">{address}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {parseResult.validAddresses.length > 10 && (
                        <div className="p-2 text-center text-xs text-muted-foreground border-t">
                          ... and {parseResult.validAddresses.length - 10} more addresses
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isDisabled}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!hasValidAddresses || isDisabled}>
            <Upload className="h-4 w-4" />
            {isUploading
              ? 'Uploading...'
              : `Upload ${hasValidAddresses ? `(${parseResult.validAddresses.length})` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
