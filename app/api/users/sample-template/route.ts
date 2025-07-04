import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Create sample data
    const sampleData = [
      {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john.doe@example.com',
        'Phone Number': '9876543210',
        'PAN Number': 'ABCDE1234F'
      },
      {
        'First Name': 'Jane',
        'Last Name': 'Smith',
        'Email': 'jane.smith@example.com',
        'Phone Number': '8765432109',
        'PAN Number': 'FGHIJ5678K'
      }
    ];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone Number
      { wch: 15 }, // PAN Number
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    // Generate Excel file buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Return the file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="user_template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error generating sample template:', error);
    return NextResponse.json(
      { error: 'Failed to generate sample template' },
      { status: 500 }
    );
  }
}
