const mongoose = require("mongoose");

const { Schema } = mongoose;
  const commentSchema = new Schema({
    postId: {
        type: Number,
    },
    nickname : {
        type: String,
    },
    commentId: {
      type: Number,
      required: true,
    },
    comment : {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Comment", commentSchema);
