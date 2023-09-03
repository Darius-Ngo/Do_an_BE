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
// const connectDB = require("./config/connectDB");

//connect DB
// connectDB();

const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("common"));
app.use(express.json());
app.use(express.static("uploads"));

//routers
app.use("/api/user", userRoute);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/region", regionRouter);
app.use("/api/authenticate", authenticateRouter);
app.use("/api/upload", uploadFileRouter);
app.use("/api/cart", cartRouter);

app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
