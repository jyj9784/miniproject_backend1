const mongoose = require("mongoose");

const { Schema } = mongoose;
const UserSchema = new Schema({
  ID:{
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    required: true,
    unique: true
  },
  hashPassword: {
    type: String,
    required: true,
  },
  password:{
    type: String,
    requried: true
  }
});

UserSchema.virtual("userId").get(function () {
  return this._id.toHexString();
});
UserSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("User", UserSchema);