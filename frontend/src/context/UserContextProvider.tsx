"use client"
import { ReactNode } from 'react';
import UserContext from './UserContext';
import { msgInfo, userInfo } from '@/utils/types';
import { useState } from 'react';

interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [user, setUser] = useState<userInfo>({} as userInfo);
  const [login, setLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('/upload-bg.png');
  const [isCreated, setIsCreated] = useState(false);
  const [messages, setMessages] = useState<msgInfo[]>([]);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      login,
      setLogin,
      isLoading,
      setIsLoading,
      imageUrl,
      setImageUrl,
      isCreated,
      setIsCreated,
      messages,
      setMessages,
    }}>
      {children}
    </UserContext.Provider>
  );
}