const connection = require("../config/connectDB");
const con = connection.promise();
const productController = {
  //GET ALL PRODUCT
  getListProduct: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      textSearch = "",
      status,
      id_loai_san_pham,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM san_pham WHERE id_loai_san_pham = ${id_loai_san_pham} ${
          status >= 0 ? `AND trang_thai_sp = ${status}` : ""
        }`,
        (err, countResult) => {
          if (err) {
            res.status(500).json({
              status: 500,
              isError: true,
              isOk: false,
              Object: err,
            });
            return;
          }
          const total = countResult[0].total;
          const query = `SELECT * FROM san_pham WHERE id_loai_san_pham = ${id_loai_san_pham} AND 
          ${status >= 0 ? `trang_thai_sp = ${status} AND` : ""} 
          ten_san_pham LIKE '${`%${textSearch}%`}' LIMIT ${startIndex}, ${parseInt(
            pageSize
          )}`;
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

  //GET DETAIL PRODUCT
  getDetailProduct: async (req, res) => {
    try {
      const query = `SELECT * FROM san_pham WHERE id = ${req.params.id}`;
      connection.query(query, async (err, results) => {
        if (err) {
          res.status(500).json({
            status: 500,
            isError: true,
            isOk: false,
            Object: err,
          });
        } else {
          const productDetail = results[0];
          res.status(200).json({
            status: 200,
            isError: false,
            isOk: true,
            Object: productDetail,
          });
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //GET LIST PRODUCT BY CATEGORY
  getProductByCategoryID: async (req, res) => {
    try {
      const query = `SELECT * FROM san_pham WHERE id_loai_san_pham = ${req.params.id}`;
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
            Object: results,
          };
          res.status(200).json(data);
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //ADD PRODUCT
  addProduct: async (req, res) => {
    const {
      anh = "",
      ten_san_pham = "",
      mo_ta = "",
      ghi_chu = "",
      gia_ban_sizes = null,
      gia_ban_sizem = null,
      gia_ban_sizel = null,
      id_loai_san_pham = null,
      giam_gia = 0,
      ngay_bd = "",
      ngay_kt = "",
    } = req.body;
    try {
      const query = `
        INSERT INTO san_pham (anh, ten_san_pham, mo_ta, gia_ban_sizes, gia_ban_sizem, gia_ban_sizel, id_loai_san_pham, giam_gia, ngay_bd, ngay_kt, ghi_chu) 
        VALUES ('${anh}', '${ten_san_pham}', '${mo_ta}', ${gia_ban_sizes}, ${gia_ban_sizem}, ${gia_ban_sizel}, ${id_loai_san_pham}, ${giam_gia}, '${ngay_bd}', '${ngay_kt}', '${ghi_chu}')`;
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
            Object: "Thêm sản phẩm thành công.",
          };
          res.status(200).json(data);
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //UPDATE PRODUCT
  updateProduct: async (req, res) => {
    const {
      id,
      anh = "",
      ten_san_pham = "",
      mo_ta = "",
      ghi_chu = "",
      gia_ban_sizes = null,
      gia_ban_sizem = null,
      gia_ban_sizel = null,
      id_loai_san_pham = null,
      giam_gia = null,
      trang_thai_sp = null,
      ngay_bd = "",
      ngay_kt = "",
    } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "Id sản phẩm đâu rồi!",
        });
      const query = `
      UPDATE san_pham
      SET anh = '${anh}', ten_san_pham = '${ten_san_pham}', ghi_chu = '${ghi_chu}', mo_ta = '${mo_ta}', gia_ban_sizes = ${gia_ban_sizes}, gia_ban_sizem = ${gia_ban_sizem}, gia_ban_sizel = ${gia_ban_sizel}, 
      id_loai_san_pham = ${id_loai_san_pham}, giam_gia = ${giam_gia}, ngay_bd = '${ngay_bd}', ngay_kt = '${ngay_kt}', trang_thai_sp = ${trang_thai_sp}
      WHERE id = ${id}`;
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
            Object: "Cập nhật sản phẩm thành công.",
          };
          res.status(200).json(data);
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //DELETE PRODUCT
  deleteProduct: async (req, res) => {
    try {
      const query = `DELETE FROM san_pham WHERE id = ${req.params.id}`;
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
          if (results.affectedRows === 0) {
            data = {
              status: 200,
              isError: false,
              isOk: true,
              Object: `Không tồn tại sản phẩm có id = ${req.params.id}`,
            };
            res.status(200).json(data);
          } else {
            data = {
              status: 200,
              isError: false,
              isOk: true,
              Object: "Xóa sản phẩm thành công.",
            };
            res.status(200).json(data);
          }
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //CHANGE STATUS PRODUCT
  changeStatus: async (req, res) => {
    const { id, isLock = null } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          isOk: false,
          Object: "Id sản phẩm đâu rồi!",
        });
      const query = `
      UPDATE san_pham
      SET trang_thai_sp = ${isLock ? 0 : 1}
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
            Object: "Cập nhật trạng thái sản phẩm thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
};

module.exports = productController;
