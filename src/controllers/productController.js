const connection = require("../config/connectDB");

const productController = {
  //GET ALL PRODUCT
  getListProduct: async (req, res) => {
    const { currentPage = 1, pageSize = 10000, textSearch = "" } = req.query;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      connection.query(
        "SELECT COUNT(*) AS total FROM san_pham",
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
          const query = `SELECT * FROM san_pham WHERE ten_san_pham LIKE '${`%${textSearch}%`}' LIMIT ${startIndex}, ${parseInt(
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

  //GET DETAIL PRODUCT
  getDetailProduct: async (req, res) => {
    try {
      const query = `SELECT * FROM san_pham WHERE id = ${req.params.id}`;
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
            Object: "Lỗi truy vấn cơ sở dữ liệu",
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
      anh,
      ten_san_pham,
      mo_ta,
      gia_ban_sizes,
      gia_ban_sizem,
      gia_ban_sizel,
      id_loai_san_pham,
    } = req.body;
    try {
      const query = `
        INSERT INTO san_pham (anh, ten_san_pham, mo_ta, gia_ban_sizes, gia_ban_sizem, gia_ban_sizel, id_loai_san_pham) 
        VALUES ('${anh}', '${ten_san_pham}', '${mo_ta}', ${parseInt(
        gia_ban_sizes
      )}, ${parseInt(gia_ban_sizem)}, ${parseInt(gia_ban_sizel)}, ${parseInt(
        id_loai_san_pham
      )})`;
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
      anh,
      ten_san_pham,
      mo_ta,
      gia_ban_sizes,
      gia_ban_sizem,
      gia_ban_sizel,
    } = req.body;
    try {
      const query = `
      UPDATE san_pham
      SET anh = '${anh}', ten_san_pham = '${ten_san_pham}', mo_ta = '${mo_ta}', gia_ban_sizes = ${gia_ban_sizes}, gia_ban_sizem = ${gia_ban_sizem}, gia_ban_sizel = ${gia_ban_sizel}
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
            Object: "Lỗi truy vấn cơ sở dữ liệu",
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
};

module.exports = productController;
