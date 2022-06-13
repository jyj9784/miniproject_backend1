const express = require("express");
const Post = require("../schemas/post");
const Comment = require("../schemas/comment");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const multer = require('multer');


//전체 조회
router.get("/", async (req, res) => {
  const posts = await Post.find(
    {},
    { postId: 1, product: 1, content: 1, image: 1 }
  ).sort({ postId: -1 });
  res.json({ posts });
});
//게시글 한개 조회
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
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
  res.json({ existsposts, existcomments });
});

//글 작성(false값 어떻게 내보낼지 보류)
router.post("/post", authMiddleware, async (req, res) => {
  const maxpostId = await Post.findOne().sort({
    postId: -1,
  });
  let postId = 1;
  if (maxpostId) {
    postId = maxpostId.postId + 1;
  }

  const { nickname } = res.locals.user;
  const { product, content, image } = req.body;

  await Post.create({
    postId,
    nickname,
    product,
    content,
    image,
  });
  res.json({ result: true });
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

//글 삭제 , 댓글까지 같이 삭제
router.delete("/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const user = res.locals.user;
  const [existpost] = await Post.find({ postId: Number(postId) });

//   if (user.nickname !== existpost.nickname) {
//     return res.status(400).json({
//       result: false,
//     });
//   }
  if (user.nickname === existpost.nickname) {
    await Post.deleteOne({ postId: Number(postId) });
    await Comment.deleteMany({ postId: Number(postId) });
    res.json({ result: true });
    return;
  }
});


// 업로드 API
/* Create new image */
router.post('/uploads', function(req, res, next) {
  res.send('test');
});

// 서버에 저장될 파라매터
router.post('/uploads/:filename', function(req, res, next) {
  // ...
});

// upload()함수 구현
var upload = function (req, res) {
  var deferred = Q.defer();
  var storage = multer.diskStorage({
    // 서버에 저장할 폴더 
    destination: function (req, file, cb) {
      cb(null, imagePath);
    },

    // 서버에 저장할 파일 명
    filename: function (req, file, cb) {
      file.uploadedFile = {
        name: req.params.filename,
        ext: file.mimetype.split('/')[1]
      };
      cb(null, file.uploadedFile.name + '.' + file.uploadedFile.ext);
    }
  });

  var upload = multer({ storage: storage }).single('file');
  upload(req, res, function (err) {
    if (err) deferred.reject();
    else deferred.resolve(req.file.uploadedFile);
  });
  return deferred.promise;
};


/* Create new image */
router.post('/uploads/:filename', function(req, res, next) {
  upload(req, res).then(function (file) {
    res.json(file);
  }, function (err) {
    res.send(500, err);
  });
});

module.exports = router;
