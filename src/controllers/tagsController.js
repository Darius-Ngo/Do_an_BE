const connection = require("../config/connectDB");
const moment = require("moment");

const tagsController = {
  //GET LIST TAGS
  getListTags: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      textSearch = "",
      status,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    const condition = `${status > 0 ? `trang_thai = ${status} AND` : ""} 
    (ma_the LIKE '${`%${textSearch}%`}' OR ten_the LIKE '${`%${textSearch}%`}')`;
    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM the_bai_viet WHERE ${condition}`,
        (err, countResult) => {
          if (err) {
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          }
          const total = countResult[0].total;
          const query = `SELECT * FROM the_bai_viet 
          WHERE ${condition} LIMIT ${startIndex}, ${parseInt(pageSize)}`;
          connection.query(query, (err, results) => {
            if (err)
              return res.status(500).json({
                status: 500,
                isError: true,
                Object: err,
              });
            res.status(200).json({
              status: 200,
              isError: false,
              Object: {
                total: total,
                data: results,
              },
            });
          });
        }
      );
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //GET TAGS COMBOBOX
  getListCombobox: async (req, res) => {
    try {
      const query = `SELECT * FROM the_bai_viet 
          WHERE trang_thai = 1`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        res.status(200).json({
          status: 200,
          isError: false,
          Object: results,
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //ADD TAGS
  addTags: async (req, res) => {
    const {
      ma_the = "",
      ten_the = "",
      ghi_chu = "",
      trang_thai = 1,
    } = req.body;
    try {
      const query = `
        INSERT INTO the_bai_viet (ma_the, ten_the, ghi_chu, trang_thai) 
        VALUES ('${ma_the}', '${ten_the}', '${ghi_chu}', ${trang_thai})`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        res.status(200).json({
          status: 200,
          isError: false,
          Object: "Thêm thẻ bài viết thành công.",
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //UPDATE TAGS
  updateTags: async (req, res) => {
    const {
      id,
      ma_the = "",
      ten_the = "",
      ghi_chu = "",
      trang_thai,
    } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "ID Thẻ bài viết đâu rồi!",
        });
      const query = `
      UPDATE the_bai_viet
      SET ma_the = '${ma_the}', ten_the = '${ten_the}', ghi_chu = '${ghi_chu}', trang_thai = ${trang_thai}
      WHERE id = ${id}`;
      connection.query(query, (err, results) => {
        if (err) {
          res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        } else {
          data = {
            status: 200,
            isError: false,
            Object: "Cập nhật thẻ bài viết thành công.",
          };
          res.status(200).json(data);
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //DELETE TAGS
  deleteTags: async (req, res) => {
    try {
      const { id_the } = req.query;
      const query = `DELETE FROM the_bai_viet WHERE id = ${id_the}`;
      connection.query(query, (err, results) => {
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
              Object: `Không tồn tại thẻ bài viết có id = ${id_the}`,
            };
            res.status(200).json(data);
          } else {
            data = {
              status: 200,
              isError: false,
              Object: "Xóa thẻ bài viết thành công.",
            };
            res.status(200).json(data);
          }
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //CHANGE STATUS TAGS
  changeStatus: async (req, res) => {
    const { id, isLock = null } = req.body;
    try {
      if (!id)
        return res.status(400).json({
          status: 0,
          isError: true,
          Object: "ID Bài viết đâu rồi!",
        });
      const query = `
      UPDATE the_bai_viet
      SET trang_thai = ${isLock ? 2 : 1}
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
            Object: "Cập nhật trạng thái thẻ bài viết thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
};

module.exports = tagsController;
