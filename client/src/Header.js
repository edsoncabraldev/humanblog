import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./userContext";

export default function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        response.json().then((userInfo) => {
          setUserInfo(userInfo);
        });
      } else {
        // Se a resposta da API não for bem-sucedida, atualize o estado do usuário para representar um estado de não autenticação
        setUserInfo({});
      }
    });
  }, []);

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    }).then((response) => {
      if (response.ok) {
        // Se a resposta da API for bem-sucedida, atualize o estado do usuário para representar um estado de não autenticação
        setUserInfo({});
      } else {
        console.error("Erro ao fazer logout");
      }
    });
  }

  const username = userInfo?.userName;

  return (
    <header className="header-info">
      <Link to="/" className="logo">
        Human Blog
      </Link>
      <nav>
        {username && (
          <>
            <span className="welcome">
              Bem vindo de volta,
              <div style={{ fontWeight: "bold" }}> {username} </div>
            </span>
            <Link to="/create">Criar um novo post</Link>
            <a onClick={logout}>Logout</a>
          </>
        )}

        {!username && (
          <>
            <Link to="/login"> Login</Link>
            <Link to="/register"> Registre-se</Link>
          </>
        )}
      </nav>
    </header>
  );
}
