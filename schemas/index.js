const mongoose = require("mongoose");

const connect = () => {
    mongoose.connect("mongodb+srv://test:sparta@cluster0.7o347.mongodb.net/blog?retryWrites=true&w=majority", { ignoreUndefined: true })
    .catch((err) => {
        console.error(err);
    });
};

module.exports = connect;