const connection = require("../config/connectDB");

const categoryController = {
  //GET ALL CATEGORY
  getListCategory: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      textSearch = "",
      status,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM loai_san_pham  ${
          status >= 0 ? `WHERE trang_thai = ${status}` : ""
        }`,
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
          const query = `SELECT * FROM loai_san_pham WHERE ${
            status >= 0 ? `trang_thai = ${status} AND` : ""
          } ten_loai_san_pham LIKE '${`%${textSearch}%`}' LIMIT ${startIndex}, ${parseInt(
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
    const { anh, ten_loai_san_pham, mo_ta, ghi_chu } = req.body;
    try {
      const query = `
        INSERT INTO loai_san_pham (anh, ten_loai_san_pham, mo_ta, ghi_chu) 
        VALUES ('${anh}', '${ten_loai_san_pham}', '${mo_ta}', '${ghi_chu}')`;
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
    const {
      id,
      anh = "",
      ten_loai_san_pham = "",
      mo_ta = "",
      ghi_chu = "",
      trang_thai,
    } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          isOk: false,
          Object: "Id danh mục đâu rồi!",
        });
      const query = `
      UPDATE loai_san_pham
      SET anh = '${anh}', ten_loai_san_pham = '${ten_loai_san_pham}', mo_ta = '${mo_ta}', ghi_chu = '${ghi_chu}', trang_thai = ${trang_thai}
      WHERE id = ${id}`;
      connection.query(query, (err, results) => {
        let data;
        if (err) {
          data = {
            status: 500,
            isError: true,
            isOk: false,
            Object: err || "Lỗi truy vấn cơ sở dữ liệu",
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
  //CHANGE STATUS CATEGORY
  changeStatus: async (req, res) => {
    const { id, isLock = null } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          isOk: false,
          Object: "Id danh mục đâu rồi!",
        });
      const query = `
      UPDATE loai_san_pham
      SET trang_thai = ${isLock ? 0 : 1}
      WHERE id = ${id}`;
      connection.query(query, (err, results) => {
        if (err) {
          res.status(500).json({
            status: 500,
            isError: true,
            isOk: false,
            Object: "Lỗi truy vấn cơ sở dữ liệu",
          });
        } else {
          res.status(200).json({
            status: 200,
            isError: false,
            isOk: true,
            Object: "Cập nhật trạng thái danh mục thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
};

module.exports = categoryController;
