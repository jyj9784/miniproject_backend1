const express = require("express");
const Post = require("../schemas/post");
const Comment = require("../schemas/comment");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();

//전체 조회
router.get("/", async (req, res) => {
  try {const posts = await Post.find(
    {},
    { postId: 1, product: 1, content: 1, image: 1, nickname: 1 }
  ).sort({ postId: -1 });
  res.json({ posts });}
  catch (err) {console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });}
});
//게시글 한개 조회
router.get("/:postId", async (req, res) => {
  try {const { postId } = req.params;
  const existsposts = await Post.find(
    { postId },
    { postId: 1, product: 1, content: 1, nickname: 1, _id: 0 }
  );
  if (!existsposts.length) {
    return res
      .status(400)
      .json({ success: false, errorMessage: "찾는 게시물 없음." });
  }

  const existcomments = await Comment.find(
    { postId },
    { commentId: 1, product: 1, comment: 1, nickname: 1, _id: 0 }
  ).sort({ commentId: -1 });
  res.json({ existsposts, existcomments });}
  catch (err) {console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });}
});

//끌어올리기
router.put("/post/pull/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const maxpostId = await Post.findOne().sort({
      postId: -1,
    });
    const existspost = await Post.find({ postId });
    if (!existspost.length) {
      res.status(400).send({
        errorMessage: "해당 게시물이 존재하지 않습니다.",
      });
      return;
    }
    if (maxpostId.postId) {
      change = maxpostId.postId + 1;
      console.log(change);
    }
    await Post.updateOne({ postId: postId }, { $set: { postId: change } });
    return res.json({ result: true });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

//글 작성(false값 어떻게 내보낼지 보류, 이미지 첨부 고려)
router.post("/post", authMiddleware, async (req, res) => {
  try {
    const maxpostId = await Post.findOne().sort({
      postId: -1,
    });
    // console.log(maxpostId)
    let postId = 1;
    if (maxpostId) {
      postId = maxpostId.postId + 1;
    }

    const { nickname } = res.locals.user;
    // console.log(nickname);
    const { product, content, image } = req.body;

    await Post.create({
      postId,
      nickname,
      product,
      content,
      image,
    });
    res.json({ result: true });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

//게시글 수정
// router.put("/post/:postId", authMiddleware, async (req, res) => {
//   const { postId } = req.params;
//   const { product, content } = req.body;

//   const existspost = await posts.find({ postId });
//   if (!existspost.length) {
//     return res
//       .status(400)
//       .json({ success: false, errorMessage: "찾는 게시물 없음." });
//   } else {
//     await posts.updateOne({ postId }, { $set: { content, product } });
//     return res.json({ success: true });
//   }
// });

//글 삭제 , 댓글까지 같이 삭제(이미지 삭제까지 고려)
router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { nickname } = res.locals.user;
    console.log(nickname);
    const [existpost] = await Post.find({ postId: Number(postId) });
    console.log(existpost);

    if (nickname === existpost.nickname || "admin" === nickname) {
      await Post.deleteOne({ postId: Number(postId) });
      await Comment.deleteMany({ postId: Number(postId) });
      res.json({ result: true });
      return;
    }
    if (nickname !== existpost.nickname) {
      res.status(400).json({
        success: false,
        errorMessage: "본인이 작성한 게시물만 삭제할 수 있습니다.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

module.exports = router;
