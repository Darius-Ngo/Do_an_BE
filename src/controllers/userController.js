const connection = require("../config/connectDB");
const bcrypt = require("bcrypt");
const excel = require("exceljs");

const userController = {
  //GET ALL USER
  getListUser: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      textSearch = "",
      isCustomer = false,
      status,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      const condition = `${
        isCustomer ? `id_phan_quyen = 3 AND` : "id_phan_quyen <> 3 AND"
      }  ${
        status > 0 ? `trang_thai = ${status} AND` : ""
      } (ho_ten LIKE '${`%${textSearch}%`}' OR sdt LIKE '${`%${textSearch}%`}' OR cccd LIKE '${`%${textSearch}%`}') `;
      connection.query(
        `SELECT COUNT(*) AS total FROM nguoi_dung 
        WHERE ${condition}`,
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
          const query = `
          SELECT n.*, CONCAT(n.thon_xom,", ", x.name,", ",q.name,", ",t.name) AS dia_chi 
          FROM nguoi_dung AS n 
          LEFT JOIN tinh_thanh_pho AS t ON n.id_tp = t.id 
          LEFT JOIN quan_huyen AS q ON n.id_qh = q.id  
          LEFT JOIN xa_phuong AS x ON n.id_xp = x.id
          WHERE ${condition}
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

  //GET DETAIL USER
  getDetailUser: async (req, res) => {
    try {
      const query = `
      SELECT n.*, CONCAT(n.thon_xom,", ", x.name,", ",q.name,", ",t.name) AS dia_chi 
      FROM nguoi_dung AS n 
      LEFT JOIN tinh_thanh_pho AS t ON n.id_tp = t.id 
      LEFT JOIN quan_huyen AS q ON n.id_qh = q.id  
      LEFT JOIN xa_phuong AS x ON n.id_xp = x.id
      WHERE n.id = ${req.params.id}`;
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
            Object: results[0],
          };
          res.status(200).json(data);
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //ADD USER
  addUser: async (req, res) => {
    const {
      avatar = "",
      username,
      password,
      ho_ten,
      ngay_sinh = null,
      thon_xom = "",
      email = "",
      gioi_tinh = null,
      sdt = "",
      id_phan_quyen,
      id_tp = "",
      id_qh = "",
      id_xp = "",
      cccd = "",
    } = req.body;
    try {
      connection.query(
        `SELECT * FROM nguoi_dung WHERE username = '${username}' OR email = '${email}'`,
        async (err, resultsCheck) => {
          if (err) {
            throw err;
          }
          if (resultsCheck.length > 0) {
            if (
              username?.toLowerCase() ===
              resultsCheck[0]?.username?.toLowerCase()
            )
              return res.status(200).json({
                status: 0,
                isError: true,
                Object: "Tên tài khoản đã tồn tại!",
              });
            if (email?.toLowerCase() === resultsCheck[0]?.email?.toLowerCase())
              return res.status(200).json({
                status: 0,
                isError: true,
                Object: "Email đã tồn tại!",
              });
          }
          const salt = await bcrypt.genSalt(10);
          const hashed = await bcrypt.hash(password, salt);
          const query = `
            INSERT INTO nguoi_dung (avatar, username, password, ho_ten, ngay_sinh, thon_xom, email, gioi_tinh, sdt, id_phan_quyen, id_tp, id_qh, id_xp, cccd) 
            VALUES ('${avatar}', '${username}', '${hashed}', '${ho_ten}', '${ngay_sinh}', '${thon_xom}', '${email}', ${gioi_tinh}, '${sdt}', ${id_phan_quyen}, '${id_tp}', '${id_qh}', '${id_xp}', '${cccd}')`;
          connection.query(query, (err, results) => {
            let data;
            if (err) {
              data = {
                status: 500,
                isError: true,
                Object: err,
              };
              res.status(500).json(data);
            } else {
              data = {
                status: 200,
                isError: false,
                Object: "Thêm người dùng thành công.",
              };
              res.status(200).json(data);
            }
          });
        }
      );
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //UPDATE USER
  updateUser: async (req, res) => {
    const {
      id,
      avatar = "",
      username,
      ho_ten,
      ngay_sinh = null,
      thon_xom = "",
      email = "",
      gioi_tinh = null,
      sdt = "",
      id_phan_quyen,
      id_tp = "",
      id_qh = "",
      id_xp = "",
      cccd = "",
      trang_thai = null,
    } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "Id người dùng đâu rồi!",
        });
      connection.query(
        `SELECT * FROM nguoi_dung WHERE username = '${username}' OR email = '${email}'`,
        async (err, resultsCheck) => {
          if (err) {
            throw err;
          }
          if (resultsCheck.length > 0 && resultsCheck[0]?.id !== id) {
            if (
              username?.toLowerCase() ===
              resultsCheck[0]?.username?.toLowerCase()
            )
              return res.status(200).json({
                status: 0,
                isError: true,
                Object: "Tên tài khoản đã tồn tại!",
              });
            if (email?.toLowerCase() === resultsCheck[0]?.email?.toLowerCase())
              return res.status(200).json({
                status: 0,
                isError: true,
                Object: "Email đã tồn tại!",
              });
          }
          const query = `
            UPDATE nguoi_dung
            SET avatar = '${avatar}', username = '${username}', ho_ten = '${ho_ten}', ngay_sinh = '${ngay_sinh}', trang_thai = ${trang_thai}, cccd = '${cccd}',
                thon_xom = '${thon_xom}', email = '${email}', gioi_tinh = ${gioi_tinh}, sdt = '${sdt}', id_phan_quyen = ${id_phan_quyen}, id_tp = '${id_tp}', id_qh = '${id_qh}', id_xp = '${id_xp}'
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
                Object: "Cập nhật người dùng thành công.",
              });
            }
          });
        }
      );
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //DELETE USER
  deleteUser: async (req, res) => {
    try {
      const query = `DELETE FROM nguoi_dung WHERE id = ${req.params.id}`;
      connection.query(query, (err, results) => {
        let data;
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
              Object: `Không tồn tại người dùng có id = ${req.params.id}`,
            };
            res.status(200).json(data);
          } else {
            data = {
              status: 200,
              isError: false,
              Object: "Xóa người dùng thành công.",
            };
            res.status(200).json(data);
          }
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },

  //CHANGE STATUS USER
  changeStatus: async (req, res) => {
    const { id, isLock = null } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "Id người dùng đâu rồi!",
        });
      const query = `
      UPDATE nguoi_dung
      SET trang_thai = ${isLock ? 2 : 1}
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
            Object: "Cập nhật trạng thái người dùng thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //RESET PASS USER
  resetPassword: async (req, res) => {
    const { id, password = "Ab@123456" } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          isOk: false,
          Object: "Id người dùng đâu rồi!",
        });
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const query = `
      UPDATE nguoi_dung
      SET password = '${hashed}'
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
            Object: "Reset mật khẩu thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //EXPORT EXCEL
  exportExcel: async (req, res) => {
    const {
      currentPage = 1,
      pageSize = 10000,
      textSearch = "",
      isCustomer = false,
      status,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    try {
      const condition = `${
        isCustomer ? `id_phan_quyen = 3 AND` : "id_phan_quyen <> 3 AND"
      }  ${
        status > 0 ? `trang_thai = ${status} AND` : ""
      } (ho_ten LIKE '${`%${textSearch}%`}' OR sdt LIKE '${`%${textSearch}%`}' OR cccd LIKE '${`%${textSearch}%`}') `;
      const query = `
      SELECT n.*, CONCAT(n.thon_xom,", ", x.name,", ",q.name,", ",t.name) AS dia_chi 
      FROM nguoi_dung AS n 
      LEFT JOIN tinh_thanh_pho AS t ON n.id_tp = t.id 
      LEFT JOIN quan_huyen AS q ON n.id_qh = q.id  
      LEFT JOIN xa_phuong AS x ON n.id_xp = x.id
      WHERE ${condition}
      LIMIT ${startIndex}, ${parseInt(pageSize)}`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });

        // Tạo một workbook mới
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet(
          isCustomer ? "Tài khoản khách hàng" : "Tài khoản nhân viên"
        );
        // Thêm dữ liệu vào worksheet
        worksheet.columns = [
          { header: "Tên tài khoản", key: "username", width: 20 },
          { header: "Ảnh đại diện", key: "avatar", width: 30 },
          { header: "Họ tên", key: "ho_ten", width: 25 },
          { header: "Số CCCD", key: "cccd", width: 20 },
          { header: "Số SĐT", key: "sdt", width: 20 },
          { header: "Email", key: "email", width: 25 },
          { header: "Giới tính", key: "gioi_tinh", width: 10 },
          { header: "Ngày sinh", key: "ngay_sinh", width: 20 },
          { header: "Địa chỉ", key: "dia_chi", width: 50 },
          { header: "Trạng thái", key: "trang_thai", width: 20 },
        ];
        const data = results.map((i) => ({
          ...i,
          gioi_tinh: i.gioi_tinh === 1 ? "Nam" : "Nữ",
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
        // // Thêm tiêu đề phía trên bảng
        // worksheet.mergeCells("A1:D1"); // Ghép ô từ A1 đến D1
        // const titleCell = worksheet.getCell("A1");
        // titleCell.value = "Tiêu Đề Phía Trên Bảng";
        // titleCell.font = { bold: true, size: 16 }; // Làm đậm và đặt kích thước chữ
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

module.exports = userController;
