const connection = require("../config/connectDB");
const moment = require("moment");

const statisticController = {
  //GET STATISTIC ORDER
  getStatisticOrder: async (req, res) => {
    const { fromDate = null, toDate = null } = req.body;
    const condition = `	ma_don_hang LIKE '%' ${
      fromDate ? `AND thoi_gian_dat >= '${fromDate}'` : ""
    } 
    ${toDate ? `AND thoi_gian_dat <= '${toDate}'` : ""}`;
    try {
      const query = `SELECT t.*, COUNT(d.id) AS tong_don
      FROM trang_thai_don AS t
      LEFT JOIN don_dat_hang AS d ON t.ma_trang_thai = d.trang_thai
      WHERE ${condition}
      GROUP BY t.ma_trang_thai`;
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const countOrder = {
          cho_xac_nhan:
            results?.find((i) => i.ma_trang_thai === 1)?.tong_don || 0,
          cho_van_chuyen:
            results?.find((i) => i.ma_trang_thai === 2)?.tong_don || 0,
          dang_van_chuyen:
            results?.find((i) => i.ma_trang_thai === 3)?.tong_don || 0,
          da_giao: results?.find((i) => i.ma_trang_thai === 4)?.tong_don || 0,
          da_huy: results?.find((i) => i.ma_trang_thai === 6)?.tong_don || 0,
          tong_don: results?.reduce(
            (currentValue, i) => i.tong_don + currentValue,
            0
          ),
        };
        const query2 = `SELECT SUM(tong_tien) AS tong_doanh_so
        FROM don_dat_hang
        WHERE ${condition} AND trang_thai = 4`;
        connection.query(query2, (err, results2) => {
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
              countOrder,
              tong_doanh_so: results2[0]?.tong_doanh_so,
            },
          });
        });
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //GET STATISTIC PRODUCT TREND
  getStatisticProductTrend: async (req, res) => {
    const { fromDate = null, toDate = null } = req.body;
    const condition = `trang_thai = 4 ${
      fromDate ? `AND thoi_gian_dat >= '${fromDate}'` : ""
    } 
    ${toDate ? `AND thoi_gian_dat <= '${toDate}'` : ""}`;
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
          const query = `SELECT SUM(std.so_luong) AS tong_sp_db, SUM(std.gia_ban * std.so_luong) AS tong_tien, sp.ten_san_pham
          FROM san_pham_trong_don AS std
          LEFT JOIN san_pham AS sp ON std.id_san_pham = sp.id
          WHERE std.id_don_hang IN (${results?.map((i) => i.id)?.toString()})
          GROUP BY std.id_san_pham
          ORDER BY tong_sp_db DESC
          LIMIT 8`;
          connection.query(query, (err, results2) => {
            if (err)
              return res.status(500).json({
                status: 500,
                isError: true,
                Object: err,
              });
            const tong = results2?.reduce(
              (current, i) => +i.tong_sp_db + current,
              0
            );
            res.status(200).json({
              status: 200,
              isError: false,
              Object: results2?.map((i) => ({
                ...i,
                phan_tram: ((+i.tong_sp_db / tong) * 100).toFixed(1),
              })),
            });
          });
        }
      );
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //GET STATISTIC CATEGORY TREND
  getStatisticByCategory: async (req, res) => {
    const { fromDate = null, toDate = null } = req.body;
    const condition = `trang_thai = 4 ${
      fromDate ? `AND thoi_gian_dat >= '${fromDate}'` : ""
    } 
    ${toDate ? `AND thoi_gian_dat <= '${toDate}'` : ""}`;
    try {
      connection.query(
        `SELECT id FROM don_dat_hang WHERE ${condition}`,
        (err, results) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          const query = `SELECT SUM(std.so_luong) AS tong_sp_db, SUM(std.gia_ban * std.so_luong) AS tong_tien, l.ten_loai_san_pham	
          FROM san_pham_trong_don AS std
          LEFT JOIN san_pham AS sp ON std.id_san_pham = sp.id
          LEFT JOIN loai_san_pham AS l ON sp.id_loai_san_pham  = l.id
          WHERE std.id_don_hang IN (${results?.map((i) => i.id)?.toString()})
          GROUP BY l.ten_loai_san_pham
          ORDER BY tong_sp_db DESC`;
          connection.query(query, (err, results2) => {
            if (err)
              return res.status(500).json({
                status: 500,
                isError: true,
                Object: err,
              });
            const tong = results2?.reduce(
              (current, i) => +i.tong_sp_db + current,
              0
            );
            res.status(200).json({
              status: 200,
              isError: false,
              Object: results2?.map((i) => ({
                ...i,
                phan_tram: ((+i.tong_sp_db / tong) * 100).toFixed(1),
              })),
            });
          });
        }
      );
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
};

module.exports = statisticController;
