const express = require("express");
const Post = require("../schemas/post");
const Comment = require("../schemas/comment");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();


//전체 조회
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find(
      {},
      { postId: 1, product: 1, content: 1, image: 1, nickname: 1 }
    ).sort({ postId: -1 });
    res.json({ posts });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});
//게시글 한개 조회
router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const existsposts = await Post.find(
      { postId },
      { postId: 1, product: 1, image: 1, content: 1, nickname: 1, _id: 0 }
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
    res.json({ existsposts, existcomments });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

//게시물 검색(닉네임 일치시 해당 작성자 게시물을 검색함)
router.get("/nicksearch", async (req, res) => {
  try {
    const { nickname } = req.body;
    const posts = await Post.find(
      { nickname },
      { postId: 1, product: 1, content: 1, image: 1, nickname: 1 }
    ).sort({ postId: -1 });
    res.json( posts );
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});
//게시물검색(내용에 해당키워드 포함시 게시물을 검색함)
router.get("/contentsearch", async (req, res) => {
  try {
    const { content } = req.body;
    const posts = await Post.find(
      {},
      { postId: 1, product: 1, content: 1, image: 1, nickname: 1 }
    ).sort({ postId: -1 });
    const targetcontent = [];
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].content.includes(content)) {
        targetcontent.push(posts[i].postId);
      }
    }
    const targetposts = [];
    for (let j = 0; j < targetcontent.length; j++) {
      const targetpost = await Post.find(
        { postId: targetcontent[j] },
        { postId: 1, product: 1, content: 1, image: 1, nickname: 1 }
      );
      targetposts.push(targetpost);
    }

    res.json(targetposts);
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});
//게시물검색(상품명검색)
router.get("/productsearch", async (req, res) => {
  try {
    const { product } = req.body;
    const posts = await Post.find(
      {},
      { postId: 1, product: 1, content: 1, image: 1, nickname: 1 }
    ).sort({ postId: -1 });
    const targetproduct = [];
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].product.includes(product)) {
        targetproduct.push(posts[i].postId);
      }
    }
    const targetposts = [];
    for (let j = 0; j < targetproduct.length; j++) {
      const targetpost = await Post.find(
        { postId: targetproduct[j] },
        { postId: 1, product: 1, content: 1, image: 1, nickname: 1 }
      );
      targetposts.push(targetpost);
    }

    res.json(targetposts);
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

//끌어올리기
router.put("/posts/post/pull/:postId", authMiddleware, async (req, res) => {
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
      // console.log(change);
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
router.post("/posts/post", authMiddleware, async (req, res) => {
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

// 게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { product, content } = req.body;
  const { nickname } = res.locals.user;

  const [existspost] = await Post.find({ postId });
  console.log(existspost.nickname);
  if (nickname !== existspost.nickname) {
    res.status(400).json({
      result: false,
      errorMessage: "본인이 작성한 게시물만 삭제할 수 있습니다.",
    });
  }

  if (nickname === existspost.nickname || "admin" === nickname) {
    await Post.updateOne({ postId }, { $set: { content, product } });
    return res.status(201).json({ result: true });
  }
});

//글 삭제 , 댓글까지 같이 삭제(이미지 삭제까지 고려)
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { nickname } = res.locals.user;
    // console.log(nickname);
    const [existpost] = await Post.find({ postId: Number(postId) });
    // console.log(existpost);

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
