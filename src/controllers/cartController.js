const connection = require("../config/connectDB");

const cartController = {
  //GET ALL CART
  getListCart: async (req, res) => {
    const { id_nguoi_dung } = req.query;
    try {
      const query = `SELECT g.*, s.anh, s.ten_san_pham FROM gio_hang AS g 
      LEFT JOIN san_pham AS s ON g.id_san_pham = s.id
      WHERE id_nguoi_dung = ${id_nguoi_dung}`;
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
            Object: results,
          });
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //ADD CART
  addToCart: async (req, res) => {
    const { id_nguoi_dung, id_san_pham, kich_co } = req.body;
    try {
      const queryCheck = `SELECT * FROM gio_hang 
      WHERE id_nguoi_dung = ${id_nguoi_dung} AND id_san_pham = ${id_san_pham}`;
      connection.query(queryCheck, (err, results) => {
        if (err) {
          return res.status(500).json({
            status: 500,
            isError: true,
            isOk: false,
            Object: err,
          });
        }
        if (results.length === 0) {
          const queryAdd = `
          INSERT INTO gio_hang (id_nguoi_dung, id_san_pham, kich_co) 
          VALUES (${id_nguoi_dung}, ${id_san_pham}, ${kich_co})`;
          connection.query(queryAdd, (err, results) => {
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
                Object: "Thêm loại sản phẩm vào giỏ hàng thành công.",
              };
              res.status(200).json(data);
            }
          });
        } else {
          return res.status(500).json({
            status: 500,
            isError: true,
            isOk: false,
            Object: "Sản phẩm đã có trong giỏ hàng",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //DELETE CART
  deleteCart: async (req, res) => {
    try {
      const { cartIds } = req.body;

      if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
        return res.status(400).json({
          status: 500,
          isError: true,
          isOk: false,
          Object: "Truyền sai kiểu dữ liệu!",
        });
      }

      const placeholders = cartIds.map(() => "?").join(",");
      const query = `DELETE FROM gio_hang WHERE id IN (${placeholders})`;
      connection.query(query, cartIds, (error, results) => {
        if (error) {
          throw error;
        }
        res.status(200).json({
          status: 200,
          isError: false,
          isOk: true,
          Object: "Xóa sản phẩm khỏi giỏ thành công.",
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
};

module.exports = cartController;
