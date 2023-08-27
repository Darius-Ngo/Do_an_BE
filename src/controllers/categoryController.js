const connection = require("../config/connectDB");

const categoryController = {
  //GET ALL CATEGORY
  getListCategory: async (req, res) => {
    const { currentPage = 1, pageSize = 10000, textSearch = "" } = req.query;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      connection.query(
        "SELECT COUNT(*) AS total FROM loai_san_pham",
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
          const query = `SELECT * FROM loai_san_pham WHERE ten_loai_san_pham LIKE '${`%${textSearch}%`}' LIMIT ${startIndex}, ${parseInt(
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

  //GET DETAIL CATEGORY
  getDetailCategory: async (req, res) => {
    try {
      const query = `SELECT * FROM loai_san_pham WHERE id = ${req.params.id}`;
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

  //ADD CATEGORY
  addCategory: async (req, res) => {
    const { anh, ten_loai_san_pham, mo_ta } = req.body;
    try {
      const query = `
        INSERT INTO loai_san_pham (anh, ten_loai_san_pham, mo_ta) 
        VALUES ('${anh}', '${ten_loai_san_pham}', '${mo_ta}')`;
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
            Object: "Thêm loại sản phẩm thành công.",
          };
          res.status(200).json(data);
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //UPDATE CATEGORY
  updateCategory: async (req, res) => {
    const { id, anh, ten_loai_san_pham, mo_ta } = req.body;
    try {
      const query = `
      UPDATE loai_san_pham
      SET anh = '${anh}', ten_loai_san_pham = '${ten_loai_san_pham}', mo_ta = '${mo_ta}'
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
            Object: "Cập nhật loại sản phẩm thành công.",
          };
          res.status(200).json(data);
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //DELETE CATEGORY
  deleteCategory: async (req, res) => {
    try {
      const query = `DELETE FROM loai_san_pham WHERE id = ${req.params.id}`;
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
              Object: `Không tồn tại loại sản phẩm có id = ${req.params.id}`,
            };
            res.status(200).json(data);
          } else {
            data = {
              status: 200,
              isError: false,
              isOk: true,
              Object: "Xóa loại sản phẩm thành công.",
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

module.exports = categoryController;
