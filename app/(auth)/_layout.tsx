import { Slot, Redirect } from 'expo-router';
import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthGroupLayout() {
  const { initialized, token } = useAuth();
  if (!initialized) return null;
  if (!token) return <Redirect href="/login" />;
  return <Slot />;
}

