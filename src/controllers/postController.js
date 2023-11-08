const connection = require("../config/connectDB");
const moment = require("moment");

const postController = {
  //GET LIST POST ADMIN
  getListPost: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      textSearch = "",
      status,
      fromDate = null,
      toDate = null,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    const condition = `${status > 0 ? `trang_thai = ${status} AND` : ""} 
    (tieu_de LIKE '${`%${textSearch}%`}' OR tom_tat LIKE '${`%${textSearch}%`}' OR noi_dung LIKE '${`%${textSearch}%`}')
    ${fromDate ? `AND ngay_dang >= '${fromDate}'` : ""} 
    ${toDate ? `AND ngay_dang <= '${toDate}'` : ""}`;
    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM bai_viet WHERE ${condition}`,
        (err, countResult) => {
          if (err) {
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          }
          const total = countResult[0].total;
          const query = `SELECT id, tieu_de, anh_mo_ta, ngay_dang, trang_thai, thu_tu, tom_tat, luot_xem FROM bai_viet 
          ORDER BY thu_tu ASC, ngay_dang DESC
          WHERE ${condition} LIMIT ${startIndex}, ${parseInt(pageSize)}`;
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

  //GET DETAIL POST
  getDetailPost: async (req, res) => {
    try {
      const { id_bai_viet } = req.query;
      if (!id_bai_viet)
        return res.status(400).json({
          status: 400,
          isError: true,
          Object: "ID bài viết đâu!",
        });
      const query = `SELECT * FROM bai_viet WHERE id = ${id_bai_viet}`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const placeholders = results[0].the_bv;
        console.log("placeholders", placeholders);
        if (!placeholders)
          return res.status(200).json({
            status: 200,
            isError: false,
            Object: results[0],
          });
        connection.query(
          `SELECT id, ten_the, ma_the FROM the_bai_viet WHERE id IN (${placeholders})`,
          (err, results2) => {
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
                ...results[0],
                the_bv: results2,
              },
            });
          }
        );
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //ADD POST
  addPost: async (req, res) => {
    const now = moment().format();
    const {
      tieu_de = "",
      tom_tat = "",
      anh_mo_ta = "",
      noi_dung = "",
      ngay_dang = now,
      trang_thai = 1,
      thu_tu,
      binh_luan_bv,
      the_bv = "",
    } = req.body;
    try {
      const query = `
        INSERT INTO bai_viet (tieu_de, tom_tat, anh_mo_ta, noi_dung, ngay_dang, trang_thai, thu_tu, binh_luan_bv, the_bv) 
        VALUES ('${tieu_de}', '${tom_tat}', '${anh_mo_ta}', '${noi_dung}', '${ngay_dang}', ${trang_thai}, ${thu_tu}, ${binh_luan_bv}, '${the_bv}')`;
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
          Object: "Thêm bài viết thành công.",
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //UPDATE POST
  updatePost: async (req, res) => {
    const {
      id,
      tieu_de = "",
      tom_tat = "",
      anh_mo_ta = "",
      noi_dung = "",
      ngay_dang,
      trang_thai,
      thu_tu,
      binh_luan_bv,
      the_bv = "",
    } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "ID Bài viết đâu rồi!",
        });
      const query = `
      UPDATE bai_viet
      SET tieu_de = '${tieu_de}', tom_tat = '${tom_tat}', anh_mo_ta = '${anh_mo_ta}', noi_dung = '${noi_dung}',
      ngay_dang = '${ngay_dang}', trang_thai = ${trang_thai}, thu_tu = ${thu_tu}, binh_luan_bv = ${binh_luan_bv}, the_bv = '${the_bv}'
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
            Object: "Cập nhật bài viết thành công.",
          };
          res.status(200).json(data);
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //DELETE POST
  deletePost: async (req, res) => {
    try {
      const { id_bai_viet } = req.query;
      const query = `DELETE FROM bai_viet WHERE id = ${id_bai_viet}`;
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
              Object: `Không tồn tại bài viết có id = ${id_bai_viet}`,
            };
            res.status(200).json(data);
          } else {
            data = {
              status: 200,
              isError: false,
              Object: "Xóa bài viết thành công.",
            };
            res.status(200).json(data);
          }
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //CHANGE STATUS POST
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
      UPDATE bai_viet
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
            Object: "Cập nhật trạng thái bài viết thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  // GET LIST POST IN HOME
  getListPostHome: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      textSearch = "",
      id_the,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    const condition = `trang_thai = 1 AND
    (tieu_de LIKE '${`%${textSearch}%`}' OR tom_tat LIKE '${`%${textSearch}%`}' OR noi_dung LIKE '${`%${textSearch}%`}')
    ${id_the ? `AND the_bv LIKE '${`%${id_the}%`}'` : ""}
    `;
    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM bai_viet WHERE ${condition}`,
        (err, countResult) => {
          if (err) {
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          }
          const total = countResult[0].total;
          const query = `SELECT id, tieu_de, anh_mo_ta, ngay_dang, luot_xem, tom_tat, the_bv FROM bai_viet 
          WHERE ${condition}
          ORDER BY thu_tu ASC, ngay_dang DESC
          LIMIT ${startIndex}, ${parseInt(pageSize)}`;
          connection.query(query, (err, results) => {
            if (err)
              return res.status(500).json({
                status: 500,
                isError: true,
                Object: err,
              });
            connection.query(`SELECT * FROM the_bai_viet`, (err, results2) => {
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
                    the_bv: results2
                      .filter((j) => i.the_bv?.includes(j.id))
                      ?.map((z) => ({
                        id_the: z.id,
                        ma_the: z.ma_the,
                        ten_the: z.ten_the,
                      })),
                  })),
                },
              });
            });
            // res.status(200).json({
            //   status: 200,
            //   isError: false,
            //   Object: {
            //     total: total,
            //     data: results,
            //   },
            // });
          });
        }
      );
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //GET DETAIL POST HOME
  getDetailPostHome: async (req, res) => {
    try {
      const { id_bai_viet, luot_xem } = req.body;
      if (!id_bai_viet)
        return res.status(400).json({
          status: 400,
          isError: true,
          Object: "ID bài viết đâu!",
        });
      const query = `SELECT * FROM bai_viet WHERE id = ${id_bai_viet}`;
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
          Object: results[0],
        });
        const queryUpdate = `
        UPDATE bai_viet SET luot_xem = ${
          luot_xem + 1
        } WHERE id = ${id_bai_viet}`;
        connection.query(queryUpdate, (err, results) => {
          if (err) console.log("err", err);
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  // GET LIST POST POPULAR
  getListPostPopular: async (req, res) => {
    const { currentPage = 1, pageSize = 5 } = req.query;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      const query = `SELECT id, tieu_de, anh_mo_ta, ngay_dang, luot_xem, tom_tat FROM bai_viet 
          WHERE trang_thai = 1
          ORDER BY luot_xem DESC
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
            Object: results,
          });
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
};

module.exports = postController;
