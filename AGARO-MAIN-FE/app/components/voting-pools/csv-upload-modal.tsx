/**
 * CSV Upload Modal Component
 *
 * Modal for bulk uploading wallet addresses via CSV file.
 * Features:
 * - Template download
 * - Drag-and-drop file upload
 * - CSV validation with preview
 * - Duplicate detection
 * - Ethereum address validation
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
import type { CSVParseResult } from '~/lib/csv-utils';
import { downloadAddressTemplate, parseAddressesCSV } from '~/lib/csv-utils';
import { cn } from '~/lib/utils';

import { useCallback, useState } from 'react';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (addresses: string[]) => void;
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

  const handleUpload = () => {
    if (!parseResult || parseResult.validAddresses.length === 0) return;
    onUpload(parseResult.validAddresses);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParseResult(null);
    setIsProcessing(false);
    onClose();
  };

  const hasValidAddresses = parseResult && parseResult.validAddresses.length > 0;
  const hasErrors = parseResult && !parseResult.isValid;

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
                isProcessing && 'opacity-50 pointer-events-none'
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
              <div className="text-center text-sm text-muted-foreground">
                Processing CSV file...
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
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left p-2 font-medium">Line</th>
                            <th className="text-left p-2 font-medium">Address</th>
                            <th className="text-left p-2 font-medium">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseResult.invalidAddresses.slice(0, 50).map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2 text-muted-foreground">{item.lineNumber}</td>
                              <td className="p-2 font-mono break-all">
                                {item.address || '(empty)'}
                              </td>
                              <td className="p-2 text-destructive">{item.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left p-2 font-medium">#</th>
                            <th className="text-left p-2 font-medium">Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseResult.validAddresses.slice(0, 10).map((address, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2 text-muted-foreground">{index + 1}</td>
                              <td className="p-2 font-mono break-all">{address}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
          <Button type="button" variant="outline" onClick={handleClose}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!hasValidAddresses || isProcessing}
          >
            <Upload className="h-4 w-4" />
            Upload {hasValidAddresses ? `(${parseResult.validAddresses.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
