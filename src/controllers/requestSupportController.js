const connection = require("../config/connectDB");
const moment = require("moment");
const gmailTransport = require("../config/gmailConfig");

const requestSupportController = {
  //GET LIST REQUEST
  getListRequest: async (req, res) => {
    const {
      id_nguoi_dung = 0,
      status = 0,
      textSearch = "",
      fromDate = "",
      toDate = "",
      currentPage = 1,
      pageSize = 10000,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;
    const condition = `${
      id_nguoi_dung > 0 ? `id_nguoi_dung = ${id_nguoi_dung} AND` : ""
    }  ${
      +status > 0 ? `y.trang_thai = ${status} AND` : ""
    } (y.ma_yc LIKE '${`%${textSearch}%`}' OR y.ho_ten LIKE '${`%${textSearch}%`}' OR y.email LIKE '${`%${textSearch}%`}' OR y.sdt LIKE '${`%${textSearch}%`}') 
    ${fromDate ? `AND thoi_gian_yc >= '${fromDate}'` : ""} ${
      toDate ? `AND thoi_gian_yc <= '${toDate}'` : ""
    }`;
    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM yeu_cau_ho_tro AS y
        WHERE ${condition}`,
        (err, countResult) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          const total = countResult[0].total;
          const query = ` SELECT y.*, n.ho_ten AS ten_nguoi_ht
          FROM yeu_cau_ho_tro AS y
          LEFT JOIN nguoi_dung AS n ON n.id = y.id_nguoi_ht
          WHERE ${condition}
          ORDER BY thoi_gian_yc DESC
          LIMIT ${startIndex}, ${parseInt(pageSize)}`;
          const setBtn = (trang_thai) => {
            switch (trang_thai) {
              case 1:
                if (id_nguoi_dung)
                  return {
                    cap_nhat: true,
                    huy: true,
                  };
                return {
                  xac_nhan: {
                    chuyen_tt: 2,
                  },
                  tu_choi: {
                    chuyen_tt: 3,
                  },
                };
              case 2:
              case 3:
                if (id_nguoi_dung) return {};
                return {
                  thu_hoi: {
                    chuyen_tt: 1,
                  },
                };
              default:
                break;
            }
          };
          connection.query(query, (err, result2) => {
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
                data: result2.map((i) => ({
                  ...i,
                  list_btns: setBtn(i.trang_thai),
                })),
              },
            });
          });
        }
      );
    } catch (err) {
      res.status(500).json(err);
    }
  },
  //ADD REQUEST
  addRequest: async (req, res) => {
    const {
      ho_ten = "",
      email = "",
      sdt = "",
      van_de_ht = "",
      id_nguoi_dung = 0,
    } = req.body;
    const thoi_gian_yc = moment().format();
    try {
      const query = `
        INSERT INTO yeu_cau_ho_tro (ho_ten, thoi_gian_yc, sdt, email, van_de_ht, id_nguoi_dung)
        VALUES ('${ho_ten}', '${thoi_gian_yc}', '${sdt}', '${email}', '${van_de_ht}', ${id_nguoi_dung})`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const id_don_hang = results.insertId;
        const ma_yc = `YCHT${id_don_hang}`;
        const query = `
        UPDATE yeu_cau_ho_tro
        SET ma_yc = '${ma_yc}'
        WHERE id = ${id_don_hang}`;
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
            Object: "Gửi yêu cầu thành công.",
          });
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //UPDATE REQUEST
  updateRequest: async (req, res) => {
    const { id, ho_ten, email, sdt, van_de_ht, phan_hoi, id_nguoi_ht } =
      req.body;
    try {
      const thoi_gian = moment().format();
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "Id đâu rồi!",
        });
      const query = `
    UPDATE yeu_cau_ho_tro
    SET ${
      !!phan_hoi
        ? `phan_hoi = '${phan_hoi}', id_nguoi_ht = ${id_nguoi_ht}, thoi_gian_ht = '${thoi_gian}' `
        : `ho_ten = '${ho_ten}', email = '${email}', sdt = '${sdt}', van_de_ht = '${van_de_ht}', thoi_gian_yc = '${thoi_gian}'`
    }
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
          Object: "Cập nhật thành công.",
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
      phan_hoi = "",
      id_nguoi_ht,
      email,
    } = req.body;
    try {
      const thoi_gian_ht = moment().format();
      if (!id)
        return res.status(200).json({
          status: 0,
          isError: true,
          Object: "Id đâu rồi!",
        });
      const query = `
    UPDATE yeu_cau_ho_tro
    SET trang_thai = ${trang_thai}, phan_hoi = '${phan_hoi}', id_nguoi_ht = ${id_nguoi_ht}, thoi_gian_ht = '${thoi_gian_ht}'
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
          Object: "Cập nhật trạng thái thành công.",
        });
        if (trang_thai === 1) return;
        let title = "";
        let content = "";
        switch (trang_thai) {
          case 2:
            title = "Hỗ trợ khách hàng.";
            content = `Yêu cầu hỗ trợ của bạn đã được chúng tôi tiếp nhận!
            - ${phan_hoi}`;
            break;
          case 3:
            title = "Từ chối hỗ trợ.";
            content = `Yêu cầu của bạn đã bị từ chối với lý do:
            - ${phan_hoi}`;
            break;
          default:
            title = "";
            content = "";
        }
        const mailOptions = {
          from: "Tiệm cafe bất ổn",
          to: email,
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
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  // DELETE REQUEST
  deleteRequest: async (req, res) => {
    try {
      const { id_yc } = req.query;
      const query = `DELETE FROM yeu_cau_ho_tro WHERE id = ${id_yc}`;
      connection.query(query, (error, results) => {
        if (error) {
          return res.status(400).json({
            status: 500,
            isError: true,
            Object: error,
          });
        }
        res.status(200).json({
          status: 200,
          isError: false,
          Object: "Xóa thành công.",
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
};

module.exports = requestSupportController;
