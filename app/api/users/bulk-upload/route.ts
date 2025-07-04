import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getUsers, saveUsers, generateId } from '@/lib/storage';
import { userSchema } from '@/lib/validations';
import { User, BulkUploadError, BulkUploadResult } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }
    
    // Read the Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty' },
        { status: 400 }
      );
    }
    
    const users = getUsers();
    const errors: BulkUploadError[] = [];
    const validUsers: User[] = [];
    const existingEmails = new Set(users.map(user => user.email));
    
    // Validate each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNumber = i + 2; // Excel row number (header is row 1)
      const rowErrors: string[] = [];
      
      try {
        // Map Excel columns to our schema
        const userData = {
          firstName: row['First Name'] || row['firstName'] || '',
          lastName: row['Last Name'] || row['lastName'] || '',
          email: row['Email'] || row['email'] || '',
          phoneNumber: row['Phone Number'] || row['phoneNumber'] || '',
          panNumber: row['PAN Number'] || row['panNumber'] || '',
        };
        
        // Validate with schema
        const validatedData = userSchema.parse(userData);
        
        // Check for duplicate email in existing users
        if (existingEmails.has(validatedData.email)) {
          rowErrors.push(`Email ${validatedData.email} already exists`);
        }
        
        // Check for duplicate email within the current batch
        const duplicateInBatch = validUsers.find(user => user.email === validatedData.email);
        if (duplicateInBatch) {
          rowErrors.push(`Duplicate email ${validatedData.email} found in the file`);
        }
        
        if (rowErrors.length === 0) {
          validUsers.push({
            id: generateId(),
            ...validatedData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          existingEmails.add(validatedData.email);
        }
      } catch (error: any) {
        if (error.errors) {
          // Zod validation errors
          for (const err of error.errors) {
            rowErrors.push(`${err.path.join('.')}: ${err.message}`);
          }
        } else {
          rowErrors.push('Invalid data format');
        }
      }
      
      if (rowErrors.length > 0) {
        errors.push({
          row: rowNumber,
          errors: rowErrors,
        });
      }
    }
    
    // If there are any errors, return them without saving
    if (errors.length > 0) {
      const result: BulkUploadResult = {
        success: false,
        message: `Found ${errors.length} error(s) in the file. Please fix them and try again.`,
        errors,
      };
      return NextResponse.json(result, { status: 400 });
    }
    
    // Save all valid users
    users.push(...validUsers);
    saveUsers(users);
    
    const result: BulkUploadResult = {
      success: true,
      message: `Successfully uploaded ${validUsers.length} user(s)`,
      successCount: validUsers.length,
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      { error: 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}
