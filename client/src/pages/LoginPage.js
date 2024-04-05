import { useContext, useState } from "react";
import { Navigate } from "react-router";
import { UserContext } from "../userContext";

export default function LoginPage() {
  const { setUserInfo } = useContext(UserContext);

  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleChangeUser = (event) => {
    setUserName(event.target.value);
  };

  const handleChangePassWord = (event) => {
    setPassWord(event.target.value);
  };

  const login = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        body: JSON.stringify({ userName, passWord }),
        headers: { "Content-Type": "application/json" },
        credentials: "include", //Salva os cookies
      });

      if (response.status === 200) {
        alert("Sucesso!");
        response.json().then((userInfo) => {
          setUserInfo(userInfo);
          setRedirect(true);
        });
      } else {
        alert("Credenciais inválidas!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <form className="login" onSubmit={login}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Usuário"
        value={userName}
        onChange={(e) => handleChangeUser(e)}
      />
      <input
        type="password"
        placeholder="Senha"
        value={passWord}
        onChange={(e) => handleChangePassWord(e)}
      />
      <button>Login</button>
    </form>
  );
}
