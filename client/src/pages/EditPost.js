import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Navigate, useParams } from "react-router";

export default function EditPost() {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [redirectHome, setRedirectHome] = useState(false);
  const [fetchData, setFetchData] = useState(true); // Flag para controlar data fetching

  const handleChangeTitle = (event) => {
    setTitle(event.target.value);
  };

  const handleChangeSummary = (event) => {
    setSummary(event.target.value);
  };

  const handleChangeFile = (event) => {
    setFile(event.target.files);
  };

  useEffect(() => {
    if (fetchData) {
      fetch("http://localhost:4000/post/" + id)
        .then(async (response) => {
          // Verifica se o status da resposta é 404 (Not Found)
          if (response.status === 404) {
            console.log("Post not found.");
            // Aqui você pode decidir o que fazer quando o post não é encontrado
            // Por exemplo, redirecionar para a página inicial ou mostrar uma mensagem
            setRedirectHome(true);
            return; // Interrompe a execução do useEffect
          }

          try {
            const postInfo = await response.json();
            setTitle(postInfo.title);
            setContent(postInfo.content);
            setSummary(postInfo.summary);
          } catch (error) {
            console.error("Error fetching post:", error);
            setRedirectHome(true);
          }
        })
        .catch((error) => {
          console.error("Error fetching post:", error);
          setRedirectHome(true);
        })
        .finally(() => {
          setFetchData(false);
          // setRedirectHome(true);
        });
    }
  }, [fetchData, id]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image"],
      ["clean"],
    ],
  };

  async function updatePost(e) {
    e.preventDefault();

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("id", id);
    if (file?.[0]) {
      data.set("file", file?.[0]);
    }

    const response = await fetch("http://localhost:4000/post", {
      method: "PUT",
      body: data,
      credentials: "include",
    });

    console.log("response", response);
    if (response.status === 200) {
      setRedirect(true);
    }
  }

  async function deletePost() {
    const response = await fetch(`http://localhost:4000/edit/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.status === 200) {
      setRedirectHome(true);
      alert("Post excluído com sucesso!");
    } else {
      console.error("Falha ao deletar o post!.");
    }
  }

  if (redirect) {
    return <Navigate to={"/post/" + id} />;
  }

  if (redirectHome) {
    return <Navigate to={"/"} />;
  }

  return (
    <div>
      <form onSubmit={updatePost}>
        <input
          type="title"
          placeholder={"Title"}
          value={title}
          onChange={(e) => handleChangeTitle(e)}
        />
        <input
          type="summary"
          placeholder={"Summary"}
          value={summary}
          onChange={(e) => handleChangeSummary(e)}
        />
        <input type="file" onChange={(e) => handleChangeFile(e)} />

        <ReactQuill
          value={content}
          modules={modules}
          onChange={(newValue) => setContent(newValue)}
        />
        <button style={{ marginTop: "5px" }}>Atualizar topico</button>
        <button onClick={deletePost} style={{ marginTop: "5px" }}>
          Excluir
        </button>
      </form>
    </div>
  );
}
