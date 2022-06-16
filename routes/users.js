require("dotenv").config();
const express = require("express");
const User = require("../schemas/user");
const Post = require("../schemas/post");
const authMiddleware = require("../middlewares/auth-middleware");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const router = express.Router();
const bcrypt = require("bcrypt");

//회원가입 조건
const postUserSchema = Joi.object({
  ID: Joi.string().alphanum().min(4).required(),

  nickname: Joi.string().required().pattern(new RegExp('^[ㄱ-ㅎㅏ-ㅣ가-힇a-zA-Z0-9]{2,16}$')),
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
//프로필페이지 조회
router.get("/profile", authMiddleware, async (req, res)=>{
  try {
    nickname = res.locals.user.nickname;
    const [users] = await User.find({nickname},
      { ID: 1, nickname: 1 , _id: 0}
      );
      const posts = await Post.find(
        { nickname },
        { postId: 1, product: 1, content: 1, image: 1, nickname: 1 }
      ).sort({ postId: -1 });
      
    res.json( {users, posts} );
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

//회원목록조회
router.get("/getuser", async (req, res) => {
  try {
    const users = await User.find({},
      { ID: 1, nickname: 1 , _id: 0}
      ).sort('-ID');
  
    res.json( users );
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
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

    res.send({
      result: true,
      token,
    });
  } catch (err) {
    res.status(400).send({
      result: false,
    });
  }
});





module.exports = router;
