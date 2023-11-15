const connection = require("../config/connectDB");
const bcrypt = require("bcrypt");

const userController = {
  //GET ALL USER
  getListUser: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      textSearch = "",
      isCustomer = false,
      status,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      const condition = `${
        isCustomer ? `id_phan_quyen = 3 AND` : "id_phan_quyen <> 3 AND"
      }  ${
        status > 0 ? `trang_thai = ${status} AND` : ""
      } (ho_ten LIKE '${`%${textSearch}%`}' OR sdt LIKE '${`%${textSearch}%`}' OR cccd LIKE '${`%${textSearch}%`}') `;
      connection.query(
        `SELECT COUNT(*) AS total FROM nguoi_dung 
        WHERE ${condition}`,
        (err, countResult) => {
          if (err) {
            res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
            return;
          }
          const total = countResult[0].total;
          const query = `
          SELECT n.*, CONCAT(n.thon_xom,", ", x.name,", ",q.name,", ",t.name) AS dia_chi 
          FROM nguoi_dung AS n 
          LEFT JOIN tinh_thanh_pho AS t ON n.id_tp = t.id 
          LEFT JOIN quan_huyen AS q ON n.id_qh = q.id  
          LEFT JOIN xa_phuong AS x ON n.id_xp = x.id
          WHERE ${condition}
          LIMIT ${startIndex}, ${parseInt(pageSize)}`;
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
                Object: {
                  total: total,
                  data: results,
                },
              });
            }
          });
        }
      );
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //GET DETAIL USER
  getDetailUser: async (req, res) => {
    try {
      const query = `
      SELECT n.*, CONCAT(n.thon_xom,", ", x.name,", ",q.name,", ",t.name) AS dia_chi 
      FROM nguoi_dung AS n 
      LEFT JOIN tinh_thanh_pho AS t ON n.id_tp = t.id 
      LEFT JOIN quan_huyen AS q ON n.id_qh = q.id  
      LEFT JOIN xa_phuong AS x ON n.id_xp = x.id
      WHERE n.id = ${req.params.id}`;
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
            Object: results[0],
          };
          res.status(200).json(data);
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //ADD USER
  addUser: async (req, res) => {
    const {
      avatar = "",
      username,
      password,
      ho_ten,
      ngay_sinh = null,
      thon_xom = "",
      email = "",
      gioi_tinh = null,
      sdt = "",
      id_phan_quyen,
      id_tp = "",
      id_qh = "",
      id_xp = "",
      cccd = "",
    } = req.body;
    try {
      connection.query(
        `SELECT * FROM nguoi_dung WHERE username = '${username}' OR email = '${email}'`,
        async (err, resultsCheck) => {
          if (err) {
            throw err;
          }
          if (resultsCheck.length > 0) {
            if (
              username?.toLowerCase() ===
              resultsCheck[0]?.username?.toLowerCase()
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
          const salt = await bcrypt.genSalt(10);
          const hashed = await bcrypt.hash(password, salt);
          const query = `
            INSERT INTO nguoi_dung (avatar, username, password, ho_ten, ngay_sinh, thon_xom, email, gioi_tinh, sdt, id_phan_quyen, id_tp, id_qh, id_xp, cccd) 
            VALUES ('${avatar}', '${username}', '${hashed}', '${ho_ten}', '${ngay_sinh}', '${thon_xom}', '${email}', ${gioi_tinh}, '${sdt}', ${id_phan_quyen}, '${id_tp}', '${id_qh}', '${id_xp}', '${cccd}')`;
          connection.query(query, (err, results) => {
            let data;
            if (err) {
              data = {
                status: 500,
                isError: true,
                Object: err,
              };
              res.status(500).json(data);
            } else {
              data = {
                status: 200,
                isError: false,
                Object: "Thêm người dùng thành công.",
              };
              res.status(200).json(data);
            }
          });
        }
      );
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //UPDATE USER
  updateUser: async (req, res) => {
    const {
      id,
      avatar = "",
      username,
      ho_ten,
      ngay_sinh = null,
      thon_xom = "",
      email = "",
      gioi_tinh = null,
      sdt = "",
      id_phan_quyen,
      id_tp = "",
      id_qh = "",
      id_xp = "",
      cccd = "",
      trang_thai = null,
    } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "Id người dùng đâu rồi!",
        });
      connection.query(
        `SELECT * FROM nguoi_dung WHERE username = '${username}' OR email = '${email}'`,
        async (err, resultsCheck) => {
          if (err) {
            throw err;
          }
          if (resultsCheck.length > 0 && resultsCheck[0]?.id !== id) {
            if (
              username?.toLowerCase() ===
              resultsCheck[0]?.username?.toLowerCase()
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
            UPDATE nguoi_dung
            SET avatar = '${avatar}', username = '${username}', ho_ten = '${ho_ten}', ngay_sinh = '${ngay_sinh}', trang_thai = ${trang_thai}, cccd = '${cccd}',
                thon_xom = '${thon_xom}', email = '${email}', gioi_tinh = ${gioi_tinh}, sdt = '${sdt}', id_phan_quyen = ${id_phan_quyen}, id_tp = '${id_tp}', id_qh = '${id_qh}', id_xp = '${id_xp}'
            WHERE id = ${id}`;
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
                Object: "Cập nhật người dùng thành công.",
              });
            }
          });
        }
      );
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //DELETE USER
  deleteUser: async (req, res) => {
    try {
      const query = `DELETE FROM nguoi_dung WHERE id = ${req.params.id}`;
      connection.query(query, (err, results) => {
        let data;
        if (err) {
          data = {
            status: 500,
            isError: true,
            Object: err,
          };
          res.status(500).json(data);
        } else {
          if (results.affectedRows === 0) {
            data = {
              status: 200,
              isError: false,
              Object: `Không tồn tại người dùng có id = ${req.params.id}`,
            };
            res.status(200).json(data);
          } else {
            data = {
              status: 200,
              isError: false,
              Object: "Xóa người dùng thành công.",
            };
            res.status(200).json(data);
          }
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //CHANGE STATUS USER
  changeStatus: async (req, res) => {
    const { id, isLock = null } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "Id người dùng đâu rồi!",
        });
      const query = `
      UPDATE nguoi_dung
      SET trang_thai = ${isLock ? 2 : 1}
      WHERE id = ${id}`;
      connection.query(query, (err, results) => {
        if (err) {
          res.status(500).json({
            status: 500,
            isError: true,
            isOk: false,
            Object: err,
          });
        } else {
          res.status(200).json({
            status: 200,
            isError: false,
            isOk: true,
            Object: "Cập nhật trạng thái người dùng thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //RESET PASS USER
  resetPassword: async (req, res) => {
    const { id, password = "Ab@123456" } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          isOk: false,
          Object: "Id người dùng đâu rồi!",
        });
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const query = `
      UPDATE nguoi_dung
      SET password = '${hashed}'
      WHERE id = ${id}`;
      connection.query(query, (err, results) => {
        if (err) {
          res.status(500).json({
            status: 500,
            isError: true,
            isOk: false,
            Object: err,
          });
        } else {
          res.status(200).json({
            status: 200,
            isError: false,
            isOk: true,
            Object: "Reset mật khẩu thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
};

module.exports = userController;
