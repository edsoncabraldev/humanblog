const express = require("express");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const Post = require("./models/Post");
const User = require("./models/User");

const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uploadMiddleware = multer({ dest: "uploads/" });
const fs = require("fs");

require("dotenv").config();
const apiKey = process.env.api_key;
mongoose.connect(apiKey);

app.use("/uploads", express.static(__dirname + "/uploads"));

const salt = bcrypt.genSaltSync(10);
const secret = "sadasd7a67dsad4as86d4as89d4sa68";

app.use(cors({ credentials: true, origin: "http://localhost:3000" })); //Pega os cookies
app.use(cookieParser());
app.use(express.json());

// Rota teste para conferir se está recebendo o Model no Banco de dados.
app.get("/test", (req, res) => {
  res.json({ message: "You've reached the /test endpoint!" });
});

// Start server
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});

//Get do Blog
app.get("/post", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", ["userName"])
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route handler for the root ("/")
app.post("/register", async (req, res) => {
  const { userName, passWord } = req.body;
  try {
    const userDoc = await User.create({
      userName,
      passWord: bcrypt.hashSync(passWord, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e.message);
    // toast.error(e.message);
  }
});

//Post do login
app.post("/login", async (req, res) => {
  const { userName, passWord } = req.body;
  const userDoc = await User.findOne({ userName });

  // Check if userDoc is null, which means no user was found with the provided userName
  if (!userDoc) {
    return res.status(400).json("Usuário não encontrado!");
  }

  const passOk = bcrypt.compareSync(passWord, userDoc.passWord);

  if (passOk) {
    //login
    jwt.sign({ userName, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json({
        id: userDoc._id,
        userName,
      });
    });
  } else {
    res.status(400).json("Credenciais inválidas!");
  }
});

//JWT Token autentication
app.get("/profile", (req, res) => {
  const { token } = req.cookies;

  // Verifique se o token está presente
  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      // Se o token for inválido ou expirado, retorne um erro
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }
    res.json(info);
  });
});

// app.post("/logout", (req, res) => {
//   res.cookie("token", "").json("ok");
// });

// Logout
app.post("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 1 }).json("ok");
});

//Post do blog
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  let coverPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname?.split("."); //pega o último
    const ext = parts[parts?.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    coverPath = newPath;
  }

  const { token } = req.cookies;

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;

    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: coverPath, // Se coverPath for null, a imagem de capa será definida como null
      author: info.id,
    });

    res.json(postDoc);
  });
});

//Atualiza o post
app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split("."); //pega o ultimo
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    console.log("req.bod", req.bod);

    const postDoc = await Post.findById(id);
    console.log("postDoc", postDoc);

    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);

    if (!isAuthor) {
      return res.status(400).json("Você não é o autor");
    }

    // Use findByIdAndUpdate to update the document
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      },
      { new: true }
    ); // The { new: true } option returns the updated document

    res.json(updatedPost);
  });
});

//Get by id do post
app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate("author", ["userName"]);
  res.json(postDoc);
});

//Delete do post
app.delete("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { token } = req.cookies;

  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido" });
    }

    try {
      const postDoc = await Post.findById(id);
      console.log("postDoc", postDoc);

      if (!postDoc) {
        return res.status(404).json({ error: "Post não encontrado" });
      }

      // Verifique se o usuário que está fazendo a solicitação é o autor do post
      if (postDoc.author.toString() !== info.id) {
        return res
          .status(403)
          .json({ error: "Você não tem permissão para excluir este post" });
      }

      // Remove o post do banco de dados
      try {
        const deletedPost = await Post.findOneAndDelete({ _id: id });
        if (deletedPost) {
          // Envia a resposta de sucesso após a exclusão
          return res.json({ message: "Post excluído com sucesso" });
        } else {
          return res.status(404).json({ error: "Post não encontrado" });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
});
