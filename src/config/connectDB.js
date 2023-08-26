// const mongoose = require("mongoose");
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.log(`Error to connect MongoDB: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.HOST || "localhost", // Thay 'localhost' bằng host của cơ sở dữ liệu
  user: process.env.USER || "root", // Thay 'username' bằng tên người dùng MySQL
  password: process.env.PASSWORD || "", // Thay 'password' bằng mật khẩu của người dùng
  database: process.env.DATABASE || "coffee-shop", // Thay 'dbname' bằng tên cơ sở dữ liệu
});

// // Kết nối với cơ sở dữ liệu
// connection.connect((err) => {
//   if (err) {
//     console.error("Lỗi kết nối:", err);
//   } else {
//     console.log("Đã kết nối thành công!");
//     // Bây giờ bạn có thể thực hiện các truy vấn ở đây
//   }
// });

// // Đóng kết nối sau khi thực hiện xong
// connection.end();
module.exports = connection;
