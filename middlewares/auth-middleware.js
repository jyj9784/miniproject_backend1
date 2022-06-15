require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../schemas/user");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const [authType, authToken] = authorization.split(" ");

  if (!authToken || authType !== "Bearer") {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
    return;
  }

  try {
    const nickname = jwt.verify(authToken, process.env.MY_SECRET_KEY);
    // console.log("토큰 " + authToken);
    // console.log("닉네임 " + nickname);
    User.findOne({ nickname }).then((user) => {
      res.locals.user = user;
      // console.log(user);
      next();
    });
  } catch (err) {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
    return;
  }
};

// const token = jwt.sign({ userId: Users.userId }, "my-secret-key");
//     console.log(`${username}님이 로그인 하셨습니다.`)
//     res.send({
//       token,
//     });
