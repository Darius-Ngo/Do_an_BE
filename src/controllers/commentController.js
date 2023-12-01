const connection = require("../config/connectDB");
const moment = require("moment");

const commentController = {
  //GET LIST COMMENT
  getListComment: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      id_bai_viet,
      id_nguoi_dung,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM binh_luan WHERE id_bai_viet = ${id_bai_viet}`,
        (err, countResult) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          const total = countResult[0].total;
          const query = `SELECT bl.*, n.ho_ten, n.avatar
          FROM binh_luan AS bl
          LEFT JOIN nguoi_dung AS n ON bl.id_nguoi_dung = n.id
          WHERE id_bai_viet = ${id_bai_viet} 
          ORDER BY 	thoi_gian_bl DESC
          LIMIT ${startIndex}, ${parseInt(pageSize)}`;
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
                data: results?.map((i) => ({
                  ...i,
                  isOwner: id_nguoi_dung === i.id_nguoi_dung,
                })),
              },
            });
          });
        }
      );
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //ADD TAGS
  addComment: async (req, res) => {
    const {
      id_bai_viet,
      id_nguoi_dung,
      noi_dung = "",
      id_bl_cha = 0,
    } = req.body;
    try {
      const thoi_gian_bl = moment().format();
      const query = `
        INSERT INTO binh_luan (id_bai_viet, id_nguoi_dung, noi_dung, id_bl_cha, thoi_gian_bl) 
        VALUES (${id_bai_viet}, ${id_nguoi_dung}, '${noi_dung}', ${id_bl_cha}, '${thoi_gian_bl}')`;
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
          Object: "Thêm bình luận thành công.",
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //UPDATE COMMENT
  updateComment: async (req, res) => {
    const { id, noi_dung = "" } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "ID Thẻ bình luận đâu rồi!",
        });
      const query = `
      UPDATE binh_luan
      SET noi_dung = '${noi_dung}'
      WHERE id = ${id}`;
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
          Object: "Cập nhật bình luận thành công.",
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //DELETE COMMENT
  deleteComment: async (req, res) => {
    try {
      const { id_bl } = req.query;
      const query = `DELETE FROM binh_luan WHERE id = ${id_bl}`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        if (results.affectedRows === 0) {
          res.status(200).json({
            status: 200,
            isError: false,
            Object: `Không tồn tại bình luận có id = ${id_the}`,
          });
        } else {
          res.status(200).json({
            status: 200,
            isError: false,
            Object: "Xóa bình luận thành công.",
          });
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
};

module.exports = commentController;
