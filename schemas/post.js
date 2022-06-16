const mongoose = require("mongoose")

const { Schema } = mongoose;
  const postSchema = new Schema({
    postId: {
        type: Number,
        required: true,
        unique: true
    },
    product: {
        type: String,
        required: true
    },
    nickname : {
        type: String
    },
    content : {
        type: String,
        required: true
    },
    image : {
      type: String,
      required: true
    }
});


module.exports = mongoose.model("Post", postSchema);