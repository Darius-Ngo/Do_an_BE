const connection = require("../config/connectDB");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const timeTokenDefault = Math.floor(Date.now() / 1000) + 60 * 0;
const timeRefreshTokenDefault = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const moment = require("moment");
const gmailTransport = require("../config/gmailConfig");
const { generateRandomString } = require("../lib/common");
const otpDatabase = {};

//Login FB
const passport = require("passport");

const authenticateController = {
  // REGISTER
  register: async (req, res) => {
    try {
      const {
        username,
        password,
        ho_ten,
        ngay_sinh,
        thon_xom,
        email,
        gioi_tinh,
        sdt,
        id_tp,
        id_qh,
        id_xp,
      } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const queryCheck = `SELECT * FROM nguoi_dung WHERE username = '${username}' OR email = '${email}'`;
      connection.query(queryCheck, (err, resultsCheck) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        if (resultsCheck?.length > 0) {
          if (
            username?.toLowerCase() === resultsCheck[0]?.username?.toLowerCase()
          )
            return res.status(200).json({
              status: 0,
              isError: true,
              Object: "Tên tài khoản đã tồn tại!",
            });
          if (email?.toLowerCase() === resultsCheck[0]?.email?.toLowerCase())
            return res.status(200).json({
              status: 0,
              isError: true,
              Object: "Email đã tồn tại!",
            });
        }
        const query = `
          INSERT INTO nguoi_dung (username, password, ho_ten, ngay_sinh, thon_xom, email, gioi_tinh, sdt, id_tp, id_qh, id_xp) 
          VALUES ('${username}', '${hashed}', '${ho_ten}', '${ngay_sinh}', '${thon_xom}', '${email}', ${gioi_tinh}, '${sdt}', '${id_tp}', '${id_qh}', '${id_xp}')`;
        connection.query(query, (err, results) => {
          if (err) {
            res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          } else {
            res.status(200).json({
              status: 200,
              isError: false,
              Object: "Đăng ký thành công.",
            });
          }
        });
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //LOGIN
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username && !password) {
        res.status(200).json({
          Object: "Tên đăng nhập hoặc mật khẩu không được để trống!",
          status: 0,
          isError: true,
        });
      }
      const query = `SELECT n.*, CONCAT(n.thon_xom,", ", x.name,", ",q.name,", ",t.name) AS dia_chi, p.ten_nhom_quyen, p.danh_sach_quyen
      FROM nguoi_dung AS n 
      LEFT JOIN tinh_thanh_pho AS t ON n.id_tp = t.id 
      LEFT JOIN quan_huyen AS q ON n.id_qh = q.id  
      LEFT JOIN xa_phuong AS x ON n.id_xp = x.id
      LEFT JOIN phan_quyen AS p ON p.id = n.id_phan_quyen
      WHERE n.username = '${username}' AND n.trang_thai = 1`;
      connection.query(query, async (err, results) => {
        if (err) {
          return res.status(500).json({
            Object: err,
            status: 500,
            isError: true,
          });
        }
        if (results.length === 0) {
          return res.status(200).json({
            Object: "Tên đăng nhập không chính xác hoặc tài khoản đã bị khóa!",
            status: 0,
            isError: true,
          });
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (bcryptError, bcryptResult) => {
          if (bcryptError) {
            throw bcryptError;
          }
          if (!bcryptResult) {
            return res.status(200).json({
              Object: "Mật khẩu không chính xác!",
              Status: 200,
              isError: true,
            });
          }
          const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.TOKEN_KEY,
            {
              expiresIn: "1h",
            }
          );
          res.status(200).json({
            status: 200,
            isError: false,
            Object: {
              ...user,
              token: token,
            },
          });
        });
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //CHANGE PASSWORD
  changePassWord: async (req, res) => {
    try {
      const { id, oldPassword, newPassword } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);
      const query = `SELECT *  
        FROM nguoi_dung
        WHERE id = ${id}`;
      connection.query(query, async (err, results) => {
        if (err) {
          throw err;
        }
        const user = results[0];
        bcrypt.compare(
          oldPassword,
          user.password,
          (bcryptError, bcryptResult) => {
            if (bcryptError) {
              throw bcryptError;
            }
            if (!bcryptResult)
              return res.status(200).json({
                Object: "Mật khẩu cũ không chính xác!",
                Status: 0,
                isError: true,
              });
            const query2 = `
              UPDATE nguoi_dung
              SET password = '${hashed}'
              WHERE id = ${id}`;
            connection.query(query2, (err, results2) => {
              if (err)
                return res.status(500).json({
                  status: 500,
                  isError: true,
                  Object: err,
                });
              res.status(200).json({
                status: 200,
                isError: false,
                Object: "Đổi mật khẩu thành công.",
              });
            });
          }
        );
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //FORGET PASSWORD
  forgetPassWord: async (req, res) => {
    try {
      const { email } = req.body;
      connection.query(
        `SELECT * FROM nguoi_dung WHERE email = '${email}'`,
        (err, results) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          if (results?.length === 0)
            return res.status(400).json({
              status: 0,
              isError: true,
              Object: "Email không chính xác",
            });
          // Tạo mã OTP ngẫu nhiên
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          // Lưu mã OTP vào cơ sở dữ liệu tạm thời
          otpDatabase[otp] = {
            otp: otp,
            email: email,
          };
          // Gửi email chứa mã OTP
          const mailOptions = {
            from: "Tiệm cafe bất ổn",
            to: email,
            subject: "OTP Xác nhận",
            text: `Mã OTP để lấy lại mật khẩu của bạn là: ${otp}`,
          };
          gmailTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Lỗi gửi email rồi ****************" + error);
            } else {
              res.status(200).json({
                isError: false,
                status: 200,
                Object: "Kiểm tra Email.",
              });
            }
          });
        }
      );
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //CONFIRM OTP
  confirmOTP: async (req, res) => {
    try {
      const { otp } = req.body;
      // Kiểm tra mã OTP
      if (otpDatabase[otp]?.otp === otp) {
        // Lưu mật khẩu mới vào cơ sở dữ liệu tạm thời
        const newPassWord = generateRandomString(8);
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassWord, salt);
        const query2 = `
        UPDATE nguoi_dung
        SET password = '${hashed}'
        WHERE email = '${otpDatabase[otp]?.email}'`;
        connection.query(query2, (err, results2) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          // Gửi email chứa mã OTP
          const mailOptions = {
            from: "Tiệm cafe bất ổn",
            to: otpDatabase[otp]?.email,
            subject: "Mật khẩu của bạn",
            text: `Mật khẩu của bạn là: ${newPassWord}`,
          };
          gmailTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Lỗi gửi email rồi ****************" + error);
            } else {
              res.status(200).json({
                isError: false,
                status: 200,
                Object: "Kiểm tra Email.",
              });
            }
          });
        });
      } else {
        res.status(400).json({
          isError: true,
          status: 0,
          message: "Mã OTP không chính xác!",
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //LOGOUT
  logout: async (req, res, next) => {
    // Clearing the cookie
    // req.clearCookie("refreshToken");
    res
      .status(200)
      .clearCookie("refreshToken")
      .json({ Status: 200, Object: null, isOk: true, isError: false });
  },

  //LOGIN FACEBOOK
  loginFacebook: async (req, res) => {
    try {
      passport.authenticate("facebook");
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //CHECK LOGIN
  checkLogin: async (req, res) => {
    try {
      if (req.isAuthenticated()) {
        res.status(200).json({ user: req.user });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //CALL BACK
  callBack: async (req, res) => {
    try {
      passport.authenticate("facebook", {
        successRedirect: "/",
        failureRedirect: "/login",
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = authenticateController;
