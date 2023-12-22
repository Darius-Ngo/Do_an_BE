const connection = require("../config/connectDB");
const moment = require("moment");
const excel = require("exceljs");

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
          status > 0 ? `WHERE trang_thai = ${status}` : ""
        }`,
        (err, countResult) => {
          if (err) {
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          }
          const total = countResult[0].total;
          const query = `SELECT * FROM loai_san_pham WHERE ${
            status > 0 ? `trang_thai = ${status} AND` : ""
          } ten_loai_san_pham LIKE '${`%${textSearch}%`}' LIMIT ${startIndex}, ${parseInt(
            pageSize
          )}`;
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

  //GET DETAIL CATEGORY
  getDetailCategory: async (req, res) => {
    try {
      const query = `SELECT * FROM loai_san_pham WHERE id = ${req.params.id}`;
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
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //ADD CATEGORY
  addCategory: async (req, res) => {
    const {
      anh = "",
      ten_loai_san_pham = "",
      mo_ta = "",
      ghi_chu = "",
    } = req.body;
    try {
      const query = `
        INSERT INTO loai_san_pham (anh, ten_loai_san_pham, mo_ta, ghi_chu) 
        VALUES ('${anh}', '${ten_loai_san_pham}', '${mo_ta}', '${ghi_chu}')`;
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
          Object: "Thêm loại sản phẩm thành công.",
        });
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
        return res.status(400).json({
          status: 0,
          isError: true,
          Object: "Id danh mục đâu rồi!",
        });
      const query = `
      UPDATE loai_san_pham
      SET anh = '${anh}', ten_loai_san_pham = '${ten_loai_san_pham}', mo_ta = '${mo_ta}', ghi_chu = '${ghi_chu}', trang_thai = ${trang_thai}
      WHERE id = ${id}`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err || err,
          });
        res.status(200).json({
          status: 200,
          isError: false,
          Object: "Cập nhật loại sản phẩm thành công.",
        });
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
        if (err) {
          res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        } else {
          if (results.affectedRows === 0) {
            res.status(200).json({
              status: 200,
              isError: false,
              Object: `Không tồn tại loại sản phẩm có id = ${req.params.id}`,
            });
          } else {
            res.status(200).json({
              status: 200,
              isError: false,
              Object: "Xóa loại sản phẩm thành công.",
            });
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
          Object: "Id danh mục đâu rồi!",
        });
      const query = `
      UPDATE loai_san_pham
      SET trang_thai = ${isLock ? 2 : 1}
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
          Object: "Cập nhật trạng thái danh mục thành công.",
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  // GET LIST CATEGORY IN HOME
  getListCategoryInHome: async (req, res) => {
    try {
      const { textSearch = "" } = req.query;
      const query1 = `SELECT * FROM loai_san_pham WHERE trang_thai = 1`;
      connection.query(query1, (err, resultsCategory) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const query2 = `SELECT s.*, IFNULL(AVG(nx.danh_gia), 0) AS danh_gia_trung_binh, IFNULL(COUNT(nx.id), 0) AS tong_danh_gia
        FROM san_pham AS s
        LEFT JOIN nhan_xet_san_pham AS nx ON s.id = nx.id_san_pham
        WHERE s.trang_thai_sp = 1 AND s.ten_san_pham LIKE '${`%${textSearch}%`}'
        GROUP BY s.id
        `;
        connection.query(query2, (err, resultsProduct) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          const data = resultsCategory.map((i) => ({
            ...i,
            ds_san_pham: resultsProduct
              .filter((j) => j.id_loai_san_pham === i.id)
              .map((i) => {
                let isDiscord = false;
                if (i.ngay_bd && i.ngay_kt && i.giam_gia) {
                  const currentDate = moment();
                  const dataMoment1 = moment(i.ngay_bd).startOf("day");
                  const dataMoment2 = moment(i.ngay_kt).endOf("day");
                  if (
                    dataMoment1?.isBefore(currentDate) &&
                    dataMoment2?.isAfter(currentDate)
                  )
                    isDiscord = true;
                }
                return {
                  ...i,
                  isDiscord,
                };
              }),
          }));
          res.status(200).json({
            status: 200,
            isError: false,
            Object: data,
          });
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //EXPORT EXCEL
  exportExcel: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      textSearch = "",
      status,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      const query = `SELECT * FROM loai_san_pham WHERE ${
        status > 0 ? `trang_thai = ${status} AND` : ""
      } ten_loai_san_pham LIKE '${`%${textSearch}%`}' LIMIT ${startIndex}, ${parseInt(
        pageSize
      )}`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        // Tạo một workbook mới
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet("Danh sách loại sản phẩm");
        // Thêm dữ liệu vào worksheet
        worksheet.columns = [
          { header: "Tên loại sản phẩm", key: "ten_loai_san_pham", width: 50 },
          { header: "Ghi chú", key: "ghi_chu", width: 30 },
          { header: "Trạng thái", key: "trang_thai", width: 25 },
          { header: "Mô tả", key: "mo_ta", width: 100 },
        ];
        const data = results.map((i) => ({
          ...i,
          trang_thai: i.trang_thai === 1 ? "Đang hoạt động" : "Không hoạt động",
        }));
        worksheet.addRows(data);
        // Áp dụng border cho toàn bảng
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          row.eachCell({ includeEmpty: true }, (cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        });

        // Áp dụng màu nền cho phần header
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFCCCCCC" }, // Màu xám nhạt
          };
          cell.font = { bold: true }; // Làm đậm chữ
          cell.alignment = { horizontal: "center" }; // Căn giữa header
        });
        // Xuất file Excel
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + "example.xlsx"
        );
        return workbook.xlsx.write(res).then(() => {
          res.status(200).end();
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
};

module.exports = categoryController;
