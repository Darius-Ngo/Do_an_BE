const connection = require("../config/connectDB");

const userController = {
  //GET ALL USER
  getListUser: async (req, res) => {
    const { currentPage = 1, pageSize = 10000, textSearch = "" } = req.query;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      connection.query(
        "SELECT COUNT(*) AS total FROM nguoi_dung",
        (err, countResult) => {
          if (err) {
            res.status(500).json({
              status: 500,
              isError: true,
              isOk: false,
              Object: "Lỗi truy vấn cơ sở dữ liệu",
            });
            return;
          }
          const total = countResult[0].total;
          const query = `SELECT * FROM nguoi_dung WHERE ho_ten LIKE '${`%${textSearch}%`}' LIMIT ${startIndex}, ${parseInt(
            pageSize
          )}`;
          connection.query(query, (err, results) => {
            let data;
            if (err) {
              data = {
                status: 500,
                isError: true,
                isOk: false,
                Object: "Lỗi truy vấn cơ sở dữ liệu",
              };
              res.status(500).json(data);
            } else {
              data = {
                status: 200,
                isError: false,
                isOk: true,
                Object: {
                  total: total,
                  data: results,
                },
              };
              res.status(200).json(data);
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
      const query = `SELECT * FROM nguoi_dung WHERE id = ${req.params.id}`;
      connection.query(query, (err, results) => {
        let data;
        if (err) {
          data = {
            status: 500,
            isError: true,
            isOk: false,
            Object: "Lỗi truy vấn cơ sở dữ liệu",
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
      avatar,
      username,
      password,
      ho_ten,
      ngay_sinh,
      dia_chi,
      email,
      gioi_tinh,
      sdt,
    } = req.body;

    try {
      const query = `
        INSERT INTO nguoi_dung (avatar, username, password, ho_ten, ngay_sinh, dia_chi, email, gioi_tinh, sdt) 
        VALUES ('${avatar}', '${username}', '${password}', '${ho_ten}', '${ngay_sinh}', '${dia_chi}', '${email}', ${parseInt(
        gioi_tinh
      )}, '${sdt}')`;
      connection.query(query, (err, results) => {
        let data;
        if (err) {
          data = {
            status: 500,
            isError: true,
            isOk: false,
            Object: "Lỗi truy vấn cơ sở dữ liệu",
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
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //UPDATE USER
  updateUser: async (req, res) => {
    const {
      id,
      avatar,
      username,
      ho_ten,
      ngay_sinh,
      dia_chi,
      email,
      gioi_tinh,
      sdt,
    } = req.body;
    try {
      const query = `
      UPDATE nguoi_dung
      SET avatar = '${avatar}', username = '${username}', ho_ten = '${ho_ten}', ngay_sinh = '${ngay_sinh}',
          dia_chi = '${dia_chi}', email = '${email}', gioi_tinh = ${parseInt(
        gioi_tinh
      )}, sdt = '${sdt}'
      WHERE id = ${id}`;
      connection.query(query, (err, results) => {
        let data;
        if (err) {
          data = {
            status: 500,
            isError: true,
            isOk: false,
            Object: "Lỗi truy vấn cơ sở dữ liệu",
          };
          res.status(500).json(data);
        } else {
          data = {
            status: 200,
            isError: false,
            isOk: true,
            Object: "Cập nhật người dùng thành công.",
          };
          res.status(200).json(data);
        }
      });
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
            isOk: false,
            Object: "Lỗi truy vấn cơ sở dữ liệu",
          };
          res.status(500).json(data);
        } else {
          if (results.affectedRows === 0) {
            data = {
              status: 200,
              isError: false,
              isOk: true,
              Object: `Không tồn tại người dùng có id = ${req.params.id}`,
            };
            res.status(200).json(data);
          } else {
            data = {
              status: 200,
              isError: false,
              isOk: true,
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
};

module.exports = userController;
