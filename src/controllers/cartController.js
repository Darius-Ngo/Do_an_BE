const connection = require("../config/connectDB");
const moment = require("moment");

const cartController = {
  //GET ALL CART
  getListCart: async (req, res) => {
    const { id_nguoi_dung } = req.query;
    try {
      const query = `SELECT g.*, s.*, s.id AS id_san_pham, g.id AS id
      FROM gio_hang AS g 
      LEFT JOIN san_pham AS s ON g.id_san_pham = s.id
      WHERE id_nguoi_dung = ${id_nguoi_dung}`;
      connection.query(query, (err, results) => {
        if (err) {
          res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        } else {
          const listData = !!results.length
            ? results.map((item) => {
                let isDiscord = false;
                if (item.ngay_bd && item.ngay_kt && item.giam_gia) {
                  const currentDate = moment();
                  const dataMoment1 = moment(item.ngay_bd);
                  const dataMoment2 = moment(item.ngay_kt);
                  if (
                    dataMoment1?.isBefore(currentDate) &&
                    dataMoment2?.isAfter(currentDate)
                  )
                    isDiscord = true;
                }
                const gia_ban =
                  item?.kich_co === 1
                    ? item.gia_ban_sizes
                    : item?.kich_co === 2
                    ? item.gia_ban_sizem
                    : item.gia_ban_sizel;
                const size =
                  item?.kich_co === 1
                    ? "Size S"
                    : item?.kich_co === 2
                    ? "Size M"
                    : "Size L";
                return {
                  gia_ban_goc: isDiscord ? gia_ban : 0,
                  gia_ban: isDiscord
                    ? gia_ban * ((100 - item.giam_gia) / 100)
                    : gia_ban,
                  size,
                  id: item.id,
                  anh: item.anh,
                  ten_san_pham: item.ten_san_pham,
                  id_san_pham: item.id_san_pham,
                  so_luong: item.so_luong,
                  kich_co: item.kich_co,
                };
              })
            : [];
          res.status(200).json({
            status: 200,
            isError: false,
            Object: listData,
          });
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },
  checkProductCart: async (req, res) => {
    const { id_san_pham, id_nguoi_dung, kich_co } = req.query;
    try {
      const query = `SELECT * FROM gio_hang
      WHERE id_nguoi_dung = ${id_nguoi_dung} AND id_san_pham = ${id_san_pham} AND kich_co = ${kich_co}`;
      // const [row, fields] = await con.query(query);
      // const rowRes = JSON.parse(JSON.stringify(row.shift()));
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
            Object: results.length > 0 ? false : true,
          });
        }
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //ADD CART
  addToCart: async (req, res) => {
    const { id_nguoi_dung, id_san_pham, kich_co, so_luong } = req.body;
    try {
      const queryCheck = `SELECT * FROM gio_hang 
      WHERE id_nguoi_dung = ${id_nguoi_dung} AND id_san_pham = ${id_san_pham} AND kich_co = ${kich_co}`;
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
          INSERT INTO gio_hang (id_nguoi_dung, id_san_pham, kich_co, so_luong) 
          VALUES (${id_nguoi_dung}, ${id_san_pham}, ${kich_co}, ${so_luong})`;
          connection.query(queryAdd, (err, results) => {
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
                Object: "Thêm sản phẩm vào giỏ hàng thành công.",
              });
            }
          });
        } else {
          return res.status(200).json({
            status: 0,
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
