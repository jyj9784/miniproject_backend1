require("dotenv").config();
const express = require("express");
const User = require("../schemas/user");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const router = express.Router();
const bcrypt = require("bcrypt");

//회원가입 조건
const postUserSchema = Joi.object({
  ID: Joi.string().alphanum().min(4).max(12).required(),
  nickname: Joi.string().alphanum().min(2).max(12).required(),
  password: Joi.string().min(4).required(),
  passwordCheck: Joi.string().required(),
});
//회원가입 - 아이디 중복체크
router.post("/idcheck", async (req, res, next) => {
  try {
    const { ID } = await postUserSchema.validateAsync(req.body);
    const existID = await User.find({ ID });

    if (existID.length) {
      return res.status(403).send("이미 사용중인 아이디입니다.");
    }
    res.status(201).send("사용할 수 있는 아이디입니다.");
  } catch (err) {
    console.error(err);
    res.status(400).send({
      errorMessage:
        "아이디는 알파벳 대/소문자 또는 숫자만 사용가능하며 4~12글자여야 합니다. ",
    });
    next(err);
  }
});
//회원가입 - 닉네임 중복체크
router.post("/nickcheck", async (req, res, next) => {
  try {
    const { nickname } = await postUserSchema.validateAsync(req.body);
    const existnickname = await User.find({ nickname });

    if (existnickname.length) {
      return res.status(403).send("이미 사용중인 닉네임입니다.");
    }
    res.status(201).send("사용할 수 있는 닉네임입니다.");
  } catch (err) {
    console.error(err);
    res.status(400).send({
      errorMessage:
        "닉네임은 한글 또는 알파벳 대/소문자, 숫자만 사용가능하며 2~12글자여야 합니다. ",
    });
    next(err);
  }
});
//회원가입
router.post("/signup", async (req, res, next) => {
  try {
    const { ID, nickname, password, passwordCheck } =
      await postUserSchema.validateAsync(req.body);

    if (password !== passwordCheck) {
      res.status(400).send({
        errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
      });
      return;
    } else if (password.includes(ID)) {
      res.status(400).send({
        errorMessage: "패스워드에 아이디가 포함되어있습니다.",
      });
      return;
    }

    const hashPassword = bcrypt.hashSync(password, 12);
    const user = new User({ ID, nickname, hashPassword });
    await user.save();

    res.status(201).send({});
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
    next(err);
  }
});

//로그인 조건 스키마
const postAuthSchema = Joi.object({
  ID: Joi.string().required(),
  password: Joi.string().required(),
});

router.post("/login", async (req, res) => {
  try {
    const { ID, password } = await postAuthSchema.validateAsync(req.body);
    const user = await User.findOne({ ID }).exec();
    const isEqualPw = await bcrypt.compare(password, user.hashPassword);
    if (!user.ID || !isEqualPw) {
      res.status(400).send({
        errorMessage: "ID 또는 Password가 틀렸습니다.",
      });
      return;
    }

    const token = jwt.sign(user.nickname, process.env.MY_SECRET_KEY);
    console.log(`${user.nickname}님이 로그인 하셨습니다.`);
    res.send({
      result: true,
      token,
    });
  } catch (err) {
    console.log("여긴가 " + err);
    res.status(400).send({
      result: false,
    });
  }
});

// 토큰정보 보내주기
router.post("/loginInfo", async (req, res) => {
  const { token } = req.body; 
  console.log(token);
  const userInfo = jwt.decode(token);
  res.json({ userInfo });
  console.log(userInfo);
});

// router.get("/User/me", authMiddleware, async (req, res) => {
//   const user = res.locals.user;
//   // user변수에 locals에있는 객체안에있는 키가 구조분해할당이 되어 들어간다
//   // 여기에 사용자 정보가 들어있다  인증용도
//   if (user) {
//     res.status(400).send({
//       errorMessage: "이미 로그인 되어있습니다.",
//     });
//     return;
//   }
// });

module.exports = router;
