import { useState } from "react";

export default function RegisterPage() {
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");

  const handleChangeUser = (event) => {
    setUserName(event.target.value);
  };

  const handleChangePassWord = (event) => {
    setPassWord(event.target.value);
  };

  const register = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        body: JSON.stringify({ userName, passWord }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        alert("Usuário criado com sucesso!");
        setUserName("");
        setPassWord("");
      } else {
        alert("Erro ao se registar!");
      }

      const data = await response.json();
      console.log(data); // Log no response
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form className="register" onSubmit={register}>
      <h1>Registre-se</h1>
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
      <button>Registrar</button>
    </form>
  );
}
