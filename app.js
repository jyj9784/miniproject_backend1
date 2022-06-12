const express = require("express");
const connect = require("./schemas");
const cors = require('cors');
const app = express();
const port = 3000;
connect();
//라우터
const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");
const commentsRouter = require("./routes/comments");

//미들웨어
app.use(express.json());
app.use(cors({
  origin: '*', // 출처 허용 옵션
  credential: 'true' // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
}));

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
