require('dotenv').config()
const express = require("express");
const connect = require("./schemas");
const cors = require('cors');
const app = express();
const port = 3000;
connect();
//라우터


// env 확인 콘솔
console.log(process.env.MY_SECRET_KEY);

const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");
const commentsRouter = require("./routes/comments");

//미들웨어
app.use(express.json());
app.use(cors());
app.use(
  "/",
  express.urlencoded({ extended: false }),
  [postsRouter],
  [usersRouter],
  [commentsRouter]
);

app.listen(port, () => {
  console.log("포트로 서버 ON!");
});
