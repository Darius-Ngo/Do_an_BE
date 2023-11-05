const connection = require("../config/connectDB");
const moment = require("moment");
const gmailTransport = require("../config/gmailConfig");

const orderController = {
  //GET TOTAL STATUS
  getTotalStatus: async (req, res) => {
    try {
      const { id_nguoi_dat } = req.query;
      const query = `
      SELECT trang_thai, t.ten_trang_thai, COUNT(*) AS so_luong_don_hang
      FROM don_dat_hang AS d 
      LEFT JOIN trang_thai_don AS t ON t.ma_trang_thai = d.trang_thai
      ${id_nguoi_dat ? `WHERE d.id_nguoi_dat = ${id_nguoi_dat}` : ""}
      GROUP BY trang_thai, ten_trang_thai`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const listStatus = [
          {
            trang_thai: 1,
            ten_trang_thai: "Chờ xác nhận",
            so_luong_don_hang: 0,
          },
          {
            trang_thai: 2,
            ten_trang_thai: "Chờ vận chuyển",
            so_luong_don_hang: 0,
          },
          {
            trang_thai: 3,
            ten_trang_thai: "Đang giao hàng",
            so_luong_don_hang: 0,
          },
          {
            trang_thai: 4,
            ten_trang_thai: "Đã giao",
            so_luong_don_hang: 0,
          },
          {
            trang_thai: 6,
            ten_trang_thai: "Đã hủy",
            so_luong_don_hang: 0,
          },
        ];
        res.status(200).json({
          status: 200,
          isError: false,
          Object: [
            {
              ten_trang_thai: "Tất cả",
              trang_thai: 0,
              so_luong_don_hang: results.reduce(
                (total, item) => item.so_luong_don_hang + total,
                0
              ),
            },
            ...listStatus?.map((i) => {
              const item = results.find((j) => i.trang_thai === j.trang_thai);
              if (item) return item;
              return i;
            }),
          ],
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //GET LIST ORDER USER
  getListOrderUser: async (req, res) => {
    const {
      id_nguoi_dat,
      status = 0,
      textSearch = "",
      fromDate = "",
      toDate = "",
      currentPage = 1,
      pageSize = 10000,
    } = req.query;
    const startIndex = (currentPage - 1) * pageSize;

    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM don_dat_hang 
        WHERE id_nguoi_dat = ${id_nguoi_dat}  ${
          +status !== 0 ? `AND trang_thai=${status}` : ""
        } AND ma_don_hang LIKE '${`%${textSearch}%`}' ${
          fromDate ? `AND thoi_gian_dat >= ${fromDate}` : ""
        } ${toDate ? `AND thoi_gian_dat <= ${toDate}` : ""}`,
        (err, countResult) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              isOk: false,
              Object: err,
            });
          const total = countResult[0].total;
          const query = ` SELECT d.*, CONCAT(d.dia_chi_chi_tiet,", ", x.name,", ",q.name,", ",t.name) AS dia_chi_nhan_hang, s.ten_trang_thai 
          FROM don_dat_hang AS d
          LEFT JOIN tinh_thanh_pho AS t ON d.id_tp = t.id 
          LEFT JOIN quan_huyen AS q ON d.id_qh = q.id  
          LEFT JOIN xa_phuong AS x ON d.id_xp = x.id
          LEFT JOIN trang_thai_don AS s ON d.trang_thai = s.ma_trang_thai
          WHERE id_nguoi_dat = ${id_nguoi_dat}  ${
            +status !== 0 ? `AND trang_thai=${status}` : ""
          } AND ma_don_hang LIKE '${`%${textSearch}%`}' ${
            fromDate ? `AND thoi_gian_dat >= ${fromDate}` : ""
          } ${toDate ? `AND thoi_gian_dat <= ${toDate}` : ""} 
          ORDER BY thoi_gian_dat DESC
          LIMIT ${startIndex}, ${parseInt(pageSize)}`;
          const setBtn = (trang_thai) => {
            switch (trang_thai) {
              case 1:
                return {
                  // xac_nhan: true,
                  huy_don: {
                    chuyen_tt: 6,
                  },
                };
              // case 2:
              //   return {
              //     giao_hang: true,
              //     huy_don: true,
              //   };
              // case 3:
              //   return {
              //     da_giao: true,
              //   };
              case 4:
                return {
                  danh_gia: {
                    chuyen_tt: 5,
                  },
                };
              case 5:
                return {
                  mua_lai: true,
                };
              case 6:
                return {
                  xem_ly_do: {
                    chuyen_tt: 5,
                  },
                  mua_lai: true,
                };
              default:
                break;
            }
          };
          connection.query(query, (err, resultsOrder) => {
            if (err)
              return res.status(500).json({
                status: 500,
                isError: true,
                Object: err,
              });
            if (!resultsOrder?.length)
              return res.status(200).json({
                status: 200,
                isError: false,
                Object: {
                  total: total,
                  data: [],
                },
              });
            connection.query(
              ` SELECT pio.*, sp.ten_san_pham, sp.anh FROM san_pham_trong_don AS pio
                LEFT JOIN san_pham AS sp ON sp.id = pio.id_san_pham
                WHERE pio.id_don_hang IN (${resultsOrder
                  .map((i) => i.id)
                  .toString()})`,
              (err, resultsProduct) => {
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
                    data: resultsOrder.map((i) => ({
                      ...i,
                      list_btns: setBtn(i.trang_thai),
                      list_product: resultsProduct.filter(
                        (j) => j.id_don_hang === i.id
                      ),
                    })),
                  },
                });
              }
            );
          });
        }
      );
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //GET DETAIL ORDER
  getDetailOrder: async (req, res) => {
    try {
      const { id_don_hang } = req.query;
      const query = `
      SELECT d.*, CONCAT(d.dia_chi_chi_tiet,", ", x.name,", ",q.name,", ",t.name) AS dia_chi_nhan_hang,
      n.avatar AS avatar_nguoi_dat, n.email AS email_nguoi_dat
      FROM don_dat_hang AS d 
      LEFT JOIN tinh_thanh_pho AS t ON d.id_tp = t.id 
      LEFT JOIN quan_huyen AS q ON d.id_qh = q.id  
      LEFT JOIN xa_phuong AS x ON d.id_xp = x.id
      LEFT JOIN nguoi_dung AS n ON d.id_nguoi_dat = n.id
      WHERE d.id = ${id_don_hang}`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const queryPr = `SELECT sptd.*, sp.anh, sp.ten_san_pham, k.ten_kich_co
          FROM san_pham_trong_don AS sptd
          LEFT JOIN san_pham AS sp ON sptd.id_san_pham = sp.id 
          LEFT JOIN kich_co_san_pham AS k ON sptd.kich_co = k.ma_kich_co
          WHERE id_don_hang = ${id_don_hang}`;
        connection.query(queryPr, (err, results2) => {
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
              Object: { ...results[0], ds_san_pham: results2 },
            });
          }
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //GET UPDATE ORDER
  getDetailUpdate: async (req, res) => {
    try {
      const { id_don_hang } = req.query;
      const query = `
      SELECT c.*, n.ho_ten, n.username, n.avatar, 
      CASE 
      WHEN n.id_phan_quyen = 1 THEN 'Quản trị'
      WHEN n.id_phan_quyen = 2 THEN 'Nhân viên'
      WHEN n.id_phan_quyen = 3 THEN 'Người dùng'
      ELSE 'Ẩn danh'
      END AS ten_phan_quyen
      FROM chi_tiet_cap_nhat_don AS c
      LEFT JOIN nguoi_dung AS n ON c.id_nguoi_cap_nhat = n.id  
      WHERE id_don_hang = ${id_don_hang}`;
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
  //ADD ORDER
  addOrder: async (req, res) => {
    const {
      ma_don = null,
      sdt_nguoi_nhan = "",
      ten_nguoi_nhan = "",
      tong_tien = 0,
      kieu_thanh_toan = 1,
      trang_thai = 1,
      id_nguoi_dat = null,
      ghi_chu = "",
      id_tp = null,
      id_qh = null,
      id_xp = null,
      dia_chi_chi_tiet = "",
      chung_tu_tt = "",
      ds_san_pham = [],
    } = req.body;
    const ma_don_hang = ma_don ? ma_don : Date.now().toString();
    const thoi_gian_dat = moment().format();
    try {
      const query = `
        INSERT INTO don_dat_hang (ma_don_hang, thoi_gian_dat, sdt_nguoi_nhan, ten_nguoi_nhan, tong_tien, kieu_thanh_toan, trang_thai, id_nguoi_dat, ghi_chu,
          id_tp, id_qh, id_xp, dia_chi_chi_tiet, chung_tu_tt) 
        VALUES ('${ma_don_hang}', '${thoi_gian_dat}', '${sdt_nguoi_nhan}', '${ten_nguoi_nhan}', ${tong_tien}, ${kieu_thanh_toan}, 
        ${trang_thai}, ${id_nguoi_dat},'${ghi_chu}', '${id_tp}', '${id_qh}', '${id_xp}', '${dia_chi_chi_tiet}', '${chung_tu_tt}')`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const id_don_hang = results.insertId;
        const san_pham_them = ds_san_pham.map((product) => {
          return [
            id_don_hang,
            product.id_san_pham,
            product.gia_ban,
            product.kich_co,
            product.so_luong,
            product.gia_ban_goc,
          ];
        });
        const query = `INSERT INTO san_pham_trong_don (id_don_hang, id_san_pham, gia_ban, kich_co, so_luong, gia_ban_goc) VALUES ?`;
        connection.query(query, [san_pham_them], (err, results) => {
          if (err) {
            res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          } else {
            const list_id = ds_san_pham.map((i) => i.id).toString();
            const query = `DELETE FROM gio_hang WHERE id IN (${list_id})`;
            connection.query(query, (error, results) => {
              if (error)
                res.status(500).json({
                  status: 500,
                  isError: true,
                  Object: err,
                });
              res.status(200).json({
                status: 200,
                isError: false,
                Object: "Thêm đơn hàng thành công.",
              });
            });
          }
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //UPDATE STATUS
  updateStatus: async (req, res) => {
    const {
      id,
      trang_thai = null,
      ly_do_huy_don = "",
      id_nguoi_cap_nhat,
    } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "Id đâu rồi!",
        });
      const query = `
    UPDATE don_dat_hang
    SET trang_thai = ${trang_thai}, ly_do_huy_don = '${ly_do_huy_don}'
    WHERE id = ${id}`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const thoi_gian_cap_nhat = moment().format();
        const query = `INSERT INTO chi_tiet_cap_nhat_don (id_don_hang, trang_thai, thoi_gian_cap_nhat, id_nguoi_cap_nhat) 
          VALUES(${id}, ${trang_thai}, '${thoi_gian_cap_nhat}', ${id_nguoi_cap_nhat})`;
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
              Object: "Cập nhật trạng thái thành công.",
            });
          }
        });
        connection.query(
          `SELECT d.*, n.email
          FROM don_dat_hang AS d
          LEFT JOIN nguoi_dung AS n ON d.id_nguoi_dat = n.id
          WHERE d.id = ${id}`,
          (err, results) => {
            if (err)
              return res.status(500).json({
                status: 500,
                isError: true,
                Object: err,
              });
            const dataDetail = results[0];
            let title = "";
            let content = "";
            switch (trang_thai) {
              case 2:
                title = "Đơn hàng đã được xác nhận";
                content = `Đơn hàng mã "${
                  dataDetail?.ma_don_hang
                }" của bạn đã được xác nhận từ cửa hàng lúc ${moment(
                  thoi_gian_cap_nhat
                ).format("HH:mm DD/MM/YYYY")} và đang chờ đơn vị vận chuyển.`;
                break;
              case 2:
                title = "Cập nhật trạng thái đơn";
                content = `Đơn hàng mã "${dataDetail?.ma_don_hang}" của bạn đã được xác nhận từ cửa hàng và đang chờ đơn vị vận chuyển.`;
                break;
              case 3:
                title = "Cập nhật trạng thái đơn";
                content = `Đơn hàng mã "${dataDetail?.ma_don_hang}" của bạn đang trên đường giao.`;
                break;
              case 4:
                title = "Đơn hàng đã giao thành công";
                content = `Đơn hàng mã "${dataDetail?.ma_don_hang}" của bạn đã được giao thành công. 
                Cảm ơn bạn đã đặt hàng và đừng quên đánh giá cảm nhận của bạn về sản phẩm nhé.`;
                break;
              case 6:
                title = "Đơn hàng đã hủy";
                content = `Đơn hàng mã "${dataDetail?.ma_don_hang}" của bạn đã hủy với lý do "${ly_do_huy_don}".`;
                break;
              default:
                title = "";
                content = "";
            }
            const mailOptions = {
              from: "Tiệm cafe bất ổn",
              to: dataDetail.email,
              subject: title,
              text: content,
            };
            gmailTransport.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error("Lỗi gửi email rồi ****************" + error);
              } else {
                console.log("Email sent: " + info.response);
              }
            });
          }
        );
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },

  //GET ADDRESS ORDER
  getListAddressOrder: async (req, res) => {
    const { id_nguoi_dung } = req.query;
    try {
      const query = ` SELECT d.*, CONCAT(d.dia_chi_chi_tiet,", ", x.name,", ",q.name,", ",t.name) AS dia_chi_nhan_hang
          FROM dia_chi_dat_hang AS d
          LEFT JOIN tinh_thanh_pho AS t ON d.id_tp = t.id 
          LEFT JOIN quan_huyen AS q ON d.id_qh = q.id  
          LEFT JOIN xa_phuong AS x ON d.id_xp = x.id
          WHERE id_nguoi_dung = ${id_nguoi_dung}`;
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
            Object: results,
          });
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //ADD ADDRESS
  addAddress: async (req, res) => {
    const {
      id_nguoi_dung = null,
      sdt_nguoi_nhan = "",
      ten_nguoi_nhan = "",
      id_tp = null,
      id_qh = null,
      id_xp = null,
      dia_chi_chi_tiet = "",
    } = req.body;
    try {
      const query = `
        INSERT INTO dia_chi_dat_hang (id_nguoi_dung, sdt_nguoi_nhan, ten_nguoi_nhan,
          id_tp, id_qh, id_xp, dia_chi_chi_tiet) 
        VALUES (${id_nguoi_dung}, '${sdt_nguoi_nhan}', '${ten_nguoi_nhan}',
          '${id_tp}', '${id_qh}', '${id_xp}', '${dia_chi_chi_tiet}')`;
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
            Object: "Lưu địa chỉ thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //UPDATE ADDRESS
  updateAddress: async (req, res) => {
    const {
      id,
      id_nguoi_dung = null,
      sdt_nguoi_nhan = "",
      ten_nguoi_nhan = "",
      id_tp = null,
      id_qh = null,
      id_xp = null,
      dia_chi_chi_tiet = "",
    } = req.body;
    try {
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          isOk: false,
          Object: "Id đâu rồi!",
        });
      const query = `
      UPDATE dia_chi_dat_hang
      SET id_nguoi_dung = ${id_nguoi_dung}, sdt_nguoi_nhan = '${sdt_nguoi_nhan}', ten_nguoi_nhan = '${ten_nguoi_nhan}',
      id_tp = '${id_tp}', id_qh = '${id_qh}', id_xp = '${id_xp}', dia_chi_chi_tiet = '${dia_chi_chi_tiet}'
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
            Object: "Cập nhật địa chỉ thành công.",
          });
        }
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //DELETE ADDRESS
  deleteAddress: async (req, res) => {
    try {
      const { idAddress } = req.body;
      if (!idAddress || !Array.isArray(idAddress) || idAddress.length === 0) {
        return res.status(400).json({
          status: 500,
          isError: true,
          Object: "Truyền sai kiểu dữ liệu!",
        });
      }
      const placeholders = idAddress.map(() => "?").join(",");
      const query = `DELETE FROM dia_chi_dat_hang WHERE id IN (${placeholders})`;
      connection.query(query, idAddress, (error, results) => {
        if (error) {
          return res.status(400).json({
            status: 500,
            isError: true,
            isOk: false,
            Object: error,
          });
        }
        res.status(200).json({
          status: 200,
          isError: false,
          isOk: true,
          Object: "Xóa địa chỉ thành công.",
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //GET LIST ORDER ADMIN
  getListOrderManager: async (req, res) => {
    const {
      status = 0,
      textSearch = "",
      fromDate = "",
      toDate = "",
      currentPage = 1,
      pageSize = 1000,
    } = req.query;
    const startIndex = (currentPage - 1) * pageSize;

    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM don_dat_hang
        WHERE ma_don_hang LIKE '${`%${textSearch}%`}' ${
          +status !== 0 ? `AND trang_thai=${status}` : ""
        }  ${fromDate ? `AND thoi_gian_dat >= ${fromDate}` : ""} ${
          toDate ? `AND thoi_gian_dat <= ${toDate}` : ""
        }`,
        (err, countResult) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          const total = countResult[0].total;
          const query = ` SELECT d.*, CONCAT(d.dia_chi_chi_tiet,", ", x.name,", ",q.name,", ",t.name) AS dia_chi_nhan_hang, 
          s.ten_trang_thai, n.ho_ten AS ten_nguoi_dat, n.sdt AS sdt_nguoi_dat,  n.email AS email_nguoi_dat
          FROM don_dat_hang AS d
          LEFT JOIN nguoi_dung AS n ON d.id_nguoi_dat = n.id
          LEFT JOIN tinh_thanh_pho AS t ON d.id_tp = t.id
          LEFT JOIN quan_huyen AS q ON d.id_qh = q.id
          LEFT JOIN xa_phuong AS x ON d.id_xp = x.id
          LEFT JOIN trang_thai_don AS s ON d.trang_thai = s.ma_trang_thai
          WHERE ma_don_hang LIKE '${`%${textSearch}%`}' ${
            +status !== 0 ? `AND d.trang_thai=${status}` : ""
          } ${fromDate ? `AND thoi_gian_dat >= ${fromDate}` : ""} ${
            toDate ? `AND thoi_gian_dat <= ${toDate}` : ""
          }
          ORDER BY thoi_gian_dat DESC
          LIMIT ${startIndex}, ${parseInt(pageSize)}`;
          const setBtn = (trang_thai) => {
            switch (trang_thai) {
              case 1:
                return {
                  xac_nhan: {
                    chuyen_tt: 2,
                  },
                  huy_don: {
                    chuyen_tt: 6,
                  },
                };
              case 2:
                return {
                  giao_hang: {
                    chuyen_tt: 3,
                  },
                  huy_don: {
                    chuyen_tt: 6,
                  },
                };
              case 3:
                return {
                  da_giao: {
                    chuyen_tt: 4,
                  },
                  huy_don: {
                    chuyen_tt: 6,
                  },
                };
              case 4:
                return {};
              case 5:
                return {
                  xem_danh_gia: true,
                };
              case 6:
                return {
                  xem_ly_do_huy: true,
                };
              default:
                break;
            }
          };
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
                  data: results.map((i) => ({
                    ...i,
                    list_btns: setBtn(i.trang_thai),
                  })),
                },
              });
            }
          });
        }
      );
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = orderController;
