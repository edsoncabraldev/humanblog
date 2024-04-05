import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function Post({
  _id,
  title,
  summary,
  cover,
  content,
  createdAt,
  author,
}) {
  const formattedDate = format(new Date(createdAt), "MMM d, yyyy HH:mm", {
    locale: ptBR,
  });

  //Data antiga
  //<time>{format(new Date(createdAt), "MMM d, yyyy HH:mm")}</time>

  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={"http://localhost:4000/" + cover} alt=""></img>
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <a className="author">{author.userName}</a>
          <time>{formattedDate}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}
