const connection = require("../config/connectDB");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const timeTokenDefault = Math.floor(Date.now() / 1000) + 60 * 0;
const timeRefreshTokenDefault = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const moment = require("moment");
// const con = db.promise();
const authenticateController = {
  // REGISTER
  register: async (req, res) => {
    try {
      const {
        avatar,
        username,
        password,
        ho_ten,
        ngay_sinh,
        thon_xom,
        email,
        gioi_tinh,
        sdt,
        id_phan_quyen = 1,
        id_tp,
        id_qh,
        id_xp,
      } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const query = `
      INSERT INTO nguoi_dung (avatar, username, password, ho_ten, ngay_sinh, thon_xom, email, gioi_tinh, sdt, id_phan_quyen) 
      VALUES ('${avatar}', '${username}', '${hashed}', '${ho_ten}', '${ngay_sinh}', '${thon_xom}', '${email}', ${parseInt(
        gioi_tinh
      )}, '${sdt}', ${id_phan_quyen}, ${id_tp}, ${id_qh}, ${id_xp})`;
      connection.query(query, (err, results) => {
        let data;
        if (err) {
          data = {
            status: 500,
            isError: true,
            isOk: false,
            Object: err,
          };
          res.status(500).json(data);
        } else {
          data = {
            status: 200,
            isError: false,
            isOk: true,
            Object: "Thêm người dùng thành công.",
          };
          res.status(200).json(data);
        }
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
          isOk: false,
        });
      }
      const query = `SELECT * FROM nguoi_dung WHERE username = '${username}' AND trang_thai = 1`;
      connection.query(query, async (err, results) => {
        if (err) {
          throw err;
        }
        if (results.length === 0) {
          return res.status(200).json({
            Object: "Tên đăng nhập không chính xác hoặc tài khoản đã bị khóa!",
            status: 0,
            isError: true,
            isOk: false,
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
              isOk: false,
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
            isOk: true,
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
  //LOGOUT
  logout: async (req, res, next) => {
    // Clearing the cookie
    // req.clearCookie("refreshToken");
    res
      .status(200)
      .clearCookie("refreshToken")
      .json({ Status: 200, Object: null, isOk: true, isError: false });
  },
  // * Middleware xác thực người dùng dựa vào mã token
  TokenCheckMiddleware: async (req, res, next) => {
    // Lấy thông tin mã token được đính kèm trong request
    const token =
      req.body.token || req.query.token || req.headers["authorization"];
    console.log("req.headers", req.headers);
    // decode token
    if (token) {
      // Xác thực mã token và kiểm tra thời gian hết hạn của mã
      try {
        var decoded = jwt.verify(token, process.env.TOKEN_KEY);
        console.log("decoded", decoded);
        // Lưu thông tin giã mã được vào đối tượng req, dùng cho các xử lý ở sau
        req.decoded = decoded;
        next();
      } catch (err) {
        //check trong db

        const [checkUserTokenDB, fields] = await con.query(
          "select count(Token) as numbertoken from usertoken where Token=?",
          [token]
        );
        const { numbertoken } = checkUserTokenDB[0];
        if (numbertoken > 0) {
          console.log("có trong db", checkUserTokenDB);
          try {
            var decoded = jwt.verify(refreshTokendb, process.env.TOKEN_KEY);
            var tokennew = jwt.sign(
              {
                exp: timeTokenDefault,
                user: decoded.user,
              },
              process.env.TOKEN_KEY
            );
            res.status(200).json({
              success: 1,
              token: tokennew,
            });
          } catch (err) {
            // return res.status(401).send("Invalid Token");

            return res.status(200).json({
              message: "Token không khả dụng",
              StatusCode: 401,
            });
          }
        } else {
          console.log("không có trong db", checkUserTokenDB);

          // Giải mã gặp lỗi: Không đúng, hết hạn...
          console.error(err);
          return res.status(200).json({
            message: "Không đúng, hết hạn",
            StatusCode: 401,
          });
        }
      }
    } else {
      // Không tìm thấy token trong request
      return res.status(200).send({
        message: "Không tìm thấy token trong request",
        StatusCode: 403,
      });
    }
  },
  //GET ALL AUTHOR
  getAllAuthor: async (req, res, next) => {
    const sql = "select * from user";
    const [rows, fields] = await con.query(sql);
    console.log(rows);
    const sql2 = "select * from user";
    const [rows2, fields2] = await con.query(sql2);

    res.json({ data1: rows, data2: rows2 });
  },

  //Login
  login2: async (req, res, next) => {
    const { username, password } = req.body;
    if (!username && !password) {
      res.status(500).json({
        Object: "Tên đăng nhập hoặc mật khẩu không được để trống",
        Status: 1,
        isError: true,
        isOk: false,
      });
    }
    const [row, fields] = await con.query(
      "select * from user where UserName=? and Password=?",
      [username, password]
    );
    console.log("a", req.body);
    console.log("a", row);

    // async function (err, row) {
    //   if (err) {
    //     res.status(500).send({ Response: "Error updating user", err });
    //   }
    if (row?.length) {
      const { UserName, UserID } = row[0];
      console.log("numberuser", UserID);
      console.log("a", row);
      console.log("b", process.env.TOKEN_KEY);
      var user = { UserName };
      var token = jwt.sign(
        { exp: Math.floor(Date.now() / 1000) + 1 * 60, user: user },
        process.env.TOKEN_KEY
      );
      var refresh_token = jwt.sign(
        { exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, user: user },
        process.env.TOKEN_KEY
      );

      const [checkUserToken, fields] = await con.query(
        "select count(UserID) as numberuser from usertoken where UserID=?",
        [UserID]
      );
      const { numberuser } = checkUserToken[0];
      console.log("numberuser", UserID);
      if (numberuser) {
        console.log("up");
        const [rowTokenUpdate, fieldsToken] = await con.query(
          "update usertoken set Token=?,RefreshToken=? where UserID=?",
          [token, refresh_token, UserID]
        );
      } else {
        console.log("in", UserID);
        const [rowTokenInset, fieldsToken2] = await con.query(
          "Insert into usertoken(ID, IsRememberPassword, Token, RefreshToken, ExpiredDate, CreateDate,UserID) values('',1,?,?,'','" +
            moment().format("YYYY-MM-DD hh:mm:ss") +
            "',?);",
          [token, refresh_token, UserID]
        );
      }
      // if (err2) {
      //   res.status(400).json({ description: "Đăng nhập không thành công" });
      // } else {
      // Tạo một cookie HTTP-only và đặt refresh token vào đó
      const refreshToken = refresh_token;
      res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true, // Sử dụng cho HTTPS
          domain: "localhost", // Tên miền của bạn
          path: "/", // Đường dẫn áp dụng cookie
          expires: timeRefreshTokenDefault, // Thời gian hết hạn (30 ngày)
        })
        .json({
          Status: 0,
          isError: false,
          isOk: true,
          Object: {
            Token: token,
            refreshToken: refresh_token,
            ...row[0],
            Sex: row[0]?.Sex.lastIndexOf(1),

            IsActive: row[0]?.IsActive.lastIndexOf(1),
            IsDelete: row[0]?.IsDelete.lastIndexOf(1),
            IsFirstLogin: row[0]?.IsFirstLogin.lastIndexOf(1),
          },
        });
      // }
    } else {
      res.status(200).json({
        Object: "Tên đăng nhập hoặc mật khẩu không đúng",
        Status: 1,
        isError: true,
        isOk: false,
      });
      next();
    }
  },
  //Cấp lại token
  refreshToken: async (req, res) => {
    console.log(req.cookies);
    const refreshToken = req.cookies.refreshToken;
    const [rowToken, fieldsToken] = await con.query(
      "select Token,refreshToken as refreshTokendb from usertoken where refreshToken=?",
      [refreshToken]
    );
    const { Token, refreshTokendb } = rowToken[0];
    // if (error)
    //   res
    //     .status(400)
    //     .json({ description: "refresh token không chính xác!" });
    // else {
    try {
      var decoded = jwt.verify(refreshTokendb, process.env.TOKEN_KEY);
      var token = jwt.sign(
        {
          exp: timeTokenDefault,
          user: decoded.user,
        },
        process.env.TOKEN_KEY
      );
      const [rowTokenUpdate, fieldsToken] = await con.query(
        "update usertoken set Token=?,RefreshToken=? where UserID=?",
        [token, refreshTokendb, decoded.user]
      );
      res.status(200).json({
        success: 1,
        token: token,
        refreshToken: refreshTokendb,
      });
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    // }
  },
};

module.exports = authenticateController;
