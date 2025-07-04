import { NextRequest, NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/storage';
import { updateUserSchema } from '@/lib/validations';
import { UpdateUserRequest } from '@/types/user';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Omit<UpdateUserRequest, 'id'> = await request.json();
    const requestData = { ...body, id: params.id };
    
    // Validate the request body
    const validatedData = updateUserSchema.parse(requestData);
    
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === params.id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check for duplicate email (excluding current user)
    const existingUser = users.find(
      user => user.email === validatedData.email && user.id !== params.id
    );
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };
    
    saveUsers(users);
    
    return NextResponse.json({ user: users[userIndex] });
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === params.id);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Remove user
    users.splice(userIndex, 1);
    saveUsers(users);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
