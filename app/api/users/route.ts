import { NextRequest, NextResponse } from 'next/server';
import { getUsers, saveUsers, generateId } from '@/lib/storage';
import { userSchema } from '@/lib/validations';
import { User, CreateUserRequest } from '@/types/user';

export async function GET() {
  try {
    const users = getUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    
    // Validate the request body
    const validatedData = userSchema.parse(body);
    
    const users = getUsers();
    
    // Check for duplicate email
    const existingUser = users.find(user => user.email === validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create new user
    const newUser: User = {
      id: generateId(),
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
