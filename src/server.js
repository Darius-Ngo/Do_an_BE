require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
var cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const userRoute = require("./routers/userRoute");
const categoryRouter = require("./routers/categoryRouter");
const productRouter = require("./routers/productRouter");
const regionRouter = require("./routers/regionRouter");
const authenticateRouter = require("./routers/authenticateRouter");
const uploadFileRouter = require("./routers/uploadFileRouter");
const cartRouter = require("./routers/cartRouter");
const orderRouter = require("./routers/orderRouter");
const rateRouter = require("./routers/rateRouter");
const postRouter = require("./routers/postRouter");
const tagsRouter = require("./routers/tagsRouter");
const commentRouter = require("./routers/commentRouter");
const requestSupportRouter = require("./routers/requestSupportRouter");
const statisticRouter = require("./routers/statisticRouter");
// const connectDB = require("./config/connectDB");
//connect DB
// connectDB();

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("common"));
app.use(express.json());
app.use(express.static("uploads"));

const passport = require("passport");
const session = require("express-session");
// Sử dụng session để lưu trữ thông tin đăng nhập
app.use(session({ secret: "lucifer", resave: true, saveUninitialized: true }));

// Khởi tạo passport
app.use(passport.initialize());
app.use(passport.session());
// Cấu hình Passport để sử dụng Facebook Strategy
const FacebookStrategy = require("passport-facebook").Strategy;
// Facebook authentication strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: "741522647787107",
      clientSecret: "763e274b64c6e1b4c003b81878f9c2be",
      callbackURL: "http://localhost:4000/api/authenticate/facebook/callback",
      // profileFields: ["id", "displayName", "photos", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      // Lưu trữ thông tin người dùng vào session
      return done(null, profile);
    }
  )
);

// Lưu thông tin user vào session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Lấy thông tin user từ session
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

//routers
app.use("/api/user", userRoute);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/region", regionRouter);
app.use("/api/authenticate", authenticateRouter);
app.use("/api/upload", uploadFileRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/rate", rateRouter);
app.use("/api/post", postRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/comment", commentRouter);
app.use("/api/request", requestSupportRouter);
app.use("/api/statistic", statisticRouter);

app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
