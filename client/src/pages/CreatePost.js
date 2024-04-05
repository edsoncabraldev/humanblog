import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Navigate } from "react-router";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleChangeTitle = (event) => {
    setTitle(event.target.value);
  };

  const handleChangeSummary = (event) => {
    setSummary(event.target.value);
  };

  const handleChangeFile = (event) => {
    setFile(event.target.files);
  };

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

  async function createNewPost(e) {
    e.preventDefault();

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("file", file[0]);

    const response = await fetch("http://localhost:4000/post", {
      method: "POST",
      body: data,
      credentials: "include",
    });

    if (response.status === 200) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <form onSubmit={createNewPost}>
      <input
        type="title"
        placeholder={"Título"}
        value={title}
        onChange={(e) => handleChangeTitle(e)}
      />
      <input
        type="summary"
        placeholder={"Sumário"}
        value={summary}
        onChange={(e) => handleChangeSummary(e)}
      />
      <input type="file" onChange={(e) => handleChangeFile(e)} />

      <ReactQuill
        value={content}
        modules={modules}
        onChange={(newValue) => setContent(newValue)}
      />
      <button style={{ marginTop: "5px" }}>Criar topico</button>
    </form>
  );
}
