const connection = require("../config/connectDB");
const con = connection.promise();
const moment = require("moment");
const excel = require("exceljs");

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
          status > 0 ? `AND trang_thai_sp = ${status}` : ""
        }`,
        (err, countResult) => {
          if (err) {
            res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
            return;
          }
          const total = countResult[0].total;
          const query = `SELECT s.*, IFNULL(AVG(nx.danh_gia), 0) AS danh_gia_trung_binh, IFNULL(COUNT(nx.id), 0) AS tong_danh_gia
          FROM san_pham AS s
          LEFT JOIN nhan_xet_san_pham AS nx ON s.id = nx.id_san_pham
          WHERE id_loai_san_pham = ${id_loai_san_pham} AND 
          ${status > 0 ? `trang_thai_sp = ${status} AND` : ""} 
          ten_san_pham LIKE '${`%${textSearch}%`}' 
          GROUP BY s.id
          LIMIT ${startIndex}, ${parseInt(pageSize)}
          `;
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
                data: results.map((i) => {
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
              },
            });
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
      connection.query(
        `SELECT SUM(std.so_luong) AS tong_sp_db
      FROM san_pham_trong_don AS std
      WHERE std.id_san_pham = ${req.params.id}`,
        async (err, resultsCount) => {
          const query = `SELECT s.*, IFNULL(AVG(nx.danh_gia), 0) AS danh_gia_trung_binh, 
          IFNULL(COUNT(nx.id), 0) AS tong_danh_gia
          FROM san_pham AS s
          LEFT JOIN nhan_xet_san_pham AS nx ON s.id = nx.id_san_pham
          WHERE s.id = ${req.params.id}`;
          connection.query(query, async (err, results) => {
            if (err) {
              res.status(500).json({
                status: 500,
                isError: true,
                Object: err,
              });
            } else {
              const productDetail = results[0];
              let isDiscord = false;
              if (
                productDetail.ngay_bd &&
                productDetail.ngay_kt &&
                productDetail.giam_gia
              ) {
                const currentDate = moment();
                const dataMoment1 = moment(productDetail.ngay_bd).startOf(
                  "day"
                );
                const dataMoment2 = moment(productDetail.ngay_kt).endOf("day");
                if (
                  dataMoment1?.isBefore(currentDate) &&
                  dataMoment2?.isAfter(currentDate)
                )
                  isDiscord = true;
              }
              res.status(200).json({
                status: 200,
                isError: false,
                Object: {
                  ...productDetail,
                  tong_sp_db: resultsCount[0]?.tong_sp_db,
                  isDiscord,
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

  //GET LIST PRODUCT BY CATEGORY
  getProductByCategoryID: async (req, res) => {
    try {
      const query = `SELECT * FROM san_pham WHERE id_loai_san_pham = ${req.params.id}`;
      connection.query(query, (err, results) => {
        let data;
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        res.status(200).json({
          status: 200,
          isError: false,
          Object: results.map((i) => {
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
        });
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
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        res.status(200).json({
          status: 200,
          isError: false,
          Object: "Thêm sản phẩm thành công.",
        });
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
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        res.status(200).json({
          status: 200,
          isError: false,
          Object: "Cập nhật sản phẩm thành công.",
        });
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
              Object: `Không tồn tại sản phẩm có id = ${req.params.id}`,
            });
          } else {
            res.status(200).json({
              status: 200,
              isError: false,
              Object: "Xóa sản phẩm thành công.",
            });
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
          Object: "Id sản phẩm đâu rồi!",
        });
      const query = `
      UPDATE san_pham
      SET trang_thai_sp = ${isLock ? 2 : 1}
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
          Object: "Cập nhật trạng thái sản phẩm thành công.",
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //GET STATISTIC PRODUCT TREND
  getListProductTrend: async (req, res) => {
    const condition = `trang_thai = 4`;
    try {
      connection.query(
        `SELECT id FROM don_dat_hang WHERE ${condition} `,
        (err, results) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          const query = `SELECT SUM(std.so_luong) AS tong_sp_db, sp.*, 
          IFNULL(AVG(nx.danh_gia), 0) AS danh_gia_trung_binh, IFNULL(COUNT(nx.id), 0) AS tong_danh_gia
          FROM san_pham_trong_don AS std
          LEFT JOIN san_pham AS sp ON std.id_san_pham = sp.id
          LEFT JOIN nhan_xet_san_pham AS nx ON sp.id = nx.id_san_pham
          WHERE std.id_don_hang IN (${results?.map((i) => i.id)?.toString()})
          GROUP BY sp.id
          ORDER BY tong_sp_db DESC
          LIMIT 8`;
          connection.query(query, (err, results2) => {
            if (err)
              return res.status(500).json({
                status: 500,
                isError: true,
                Object: err,
              });
            res.status(200).json({
              status: 200,
              isError: false,
              Object: results2.map((i) => {
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
            });
          });
        }
      );
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
      id_loai_san_pham,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      const query = `SELECT s.*, IFNULL(AVG(nx.danh_gia), 0) AS danh_gia_trung_binh, IFNULL(COUNT(nx.id), 0) AS tong_danh_gia
      FROM san_pham AS s
      LEFT JOIN nhan_xet_san_pham AS nx ON s.id = nx.id_san_pham
      WHERE id_loai_san_pham = ${id_loai_san_pham} AND 
      ${status > 0 ? `trang_thai_sp = ${status} AND` : ""} 
      ten_san_pham LIKE '${`%${textSearch}%`}' 
      GROUP BY s.id
      LIMIT ${startIndex}, ${parseInt(pageSize)}
      `;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        // Tạo một workbook mới
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet("Danh sách sản phẩm");
        // Thêm dữ liệu vào worksheet
        worksheet.columns = [
          { header: "Tên sản phẩm", key: "ten_san_pham", width: 30 },
          { header: "Ảnh sản phẩm", key: "anh", width: 30 },
          { header: "Giá Size S", key: "gia_ban_sizes", width: 10 },
          { header: "Giá Size M", key: "gia_ban_sizem", width: 10 },
          { header: "Giá Size L", key: "gia_ban_sizel", width: 10 },
          { header: "Trạng thái", key: "trang_thai_sp", width: 25 },
          { header: "Ghi chú", key: "	ghi_chu", width: 25 },
          { header: "Mô tả", key: "mo_ta", width: 100 },
        ];
        const data = results.map((i) => ({
          ...i,
          trang_thai_sp:
            i.trang_thai_sp === 1 ? "Đang hoạt động" : "Không hoạt động",
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

module.exports = productController;
