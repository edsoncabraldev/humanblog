import { createContext, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [userInfo, setUserInfo] = useState({});

  const logout = async () => {
    await fetch("http://localhost:4000/logout", {
      method: "POST",
      credentials: "include", // Envia cookies
    });

    // Atualiza o state de usuário caso não autenticado
    setUserInfo({});
  };

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, logout }}>
      {children}
    </UserContext.Provider>
  );
}
