"use client";

import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, CloudUpload, FileText, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BulkUploadResult } from "@/types/user";
import { toast } from "sonner";

interface BulkUploadProps {
  onSuccess: () => void;
}

export function BulkUpload({ onSuccess }: BulkUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch('/api/users/sample-template');
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'userflow_pro_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Template downloaded successfully!', {
        description: 'Use this template to format your user data correctly.',
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/users/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result: BulkUploadResult = await response.json();
      setUploadResult(result);

      if (result.success) {
        toast.success(result.message, {
          description: `Successfully processed ${result.successCount} users.`,
        });
        onSuccess();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(result.message, {
          description: 'Please check the errors below and try again.',
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        handleFileUpload(file);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="card-hover border-0 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <CloudUpload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Bulk Data Import</CardTitle>
              <p className="text-muted-foreground mt-1">
                Upload Excel files to import multiple users at once
              </p>
            </div>
          </motion.div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Step 1: Download Template */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="font-semibold text-lg">Download Template</h3>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-2">Excel Template with Sample Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download our pre-formatted Excel template with sample data and correct column headers. 
                    This ensures your data is properly structured for import.
                  </p>
                  <Button
                    onClick={downloadTemplate}
                    disabled={isDownloading}
                    variant="outline"
                    className="button-glow"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Upload File */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className="font-semibold text-lg">Upload Your Data</h3>
            </div>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ 
                    scale: dragActive ? 1.1 : 1,
                    rotate: dragActive ? 5 : 0 
                  }}
                  className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto"
                >
                  <Upload className={`h-8 w-8 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </motion.div>
                
                <div>
                  <h4 className="font-medium mb-2">
                    {dragActive ? 'Drop your file here' : 'Drag & drop your Excel file'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse and select your file
                  </p>
                  
                  <div className="space-y-4">
                    <Label htmlFor="excel-file" className="cursor-pointer">
                      <Input
                        ref={fileInputRef}
                        id="excel-file"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        disabled={isUploading}
                        className="button-glow"
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Choose Excel File
                      </Button>
                    </Label>
                    
                    <AnimatePresence>
                      {isUploading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing your file...
                          </div>
                          <Progress value={uploadProgress} className="w-full" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Upload Result */}
          <AnimatePresence>
            {uploadResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Alert className={`border-2 ${uploadResult.success ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {uploadResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </motion.div>
                  <AlertDescription className="font-medium text-base">
                    {uploadResult.message}
                  </AlertDescription>
                </Alert>

                {!uploadResult.success && uploadResult.errors && uploadResult.errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <h4 className="font-semibold text-red-600">Validation Errors Found</h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-3 bg-red-50 dark:bg-red-950/50 rounded-lg p-4">
                      {uploadResult.errors.map((error, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white dark:bg-red-900/50 p-4 rounded-lg border border-red-200 dark:border-red-800"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {error.row}
                            </div>
                            <p className="font-medium text-red-800 dark:text-red-200">
                              Row {error.row} Issues:
                            </p>
                          </div>
                          <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                            {error.errors.map((err, errIndex) => (
                              <li key={errIndex} className="flex items-start gap-2">
                                <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{err}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Format Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 dark:bg-blue-950/50 p-6 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                  Data Format Requirements
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700 dark:text-blue-300">
                        <strong>First Name:</strong> Required, max 50 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700 dark:text-blue-300">
                        <strong>Last Name:</strong> Required, max 50 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700 dark:text-blue-300">
                        <strong>Email:</strong> Required, valid email format
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700 dark:text-blue-300">
                        <strong>Phone:</strong> Required, exactly 10 digits
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-700 dark:text-blue-300">
                        <strong>PAN:</strong> 5 letters + 4 digits + 1 letter
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}