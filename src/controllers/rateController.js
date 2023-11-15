const connection = require("../config/connectDB");
const moment = require("moment");

const rateController = {
  //RATE ORDER
  rateOrder: async (req, res) => {
    const { id_nguoi_dung, id_don_hang, list_danh_gia } = req.body;
    try {
      const queryUpdate = `UPDATE don_dat_hang SET da_danh_gia = ${1} WHERE id = ${id_don_hang}`;
      connection.query(queryUpdate, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const thoi_gian_cap_nhat = moment().format();
        const queryInsert = `INSERT INTO chi_tiet_cap_nhat_don (id_don_hang, trang_thai, thoi_gian_cap_nhat, id_nguoi_cap_nhat) 
          VALUES(${id_don_hang}, 5, '${thoi_gian_cap_nhat}', ${id_nguoi_dung})`;
        connection.query(queryInsert, (err, results) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          const danh_gia_sp = list_danh_gia.map((rate) => {
            return [
              id_nguoi_dung,
              id_don_hang,
              rate.id_san_pham,
              rate.danh_gia,
              rate.noi_dung,
              rate.anh_mo_ta?.toString(),
              rate.video_mo_ta?.toString(),
              rate.kich_co_sp,
              thoi_gian_cap_nhat,
            ];
          });
          const query = `INSERT INTO nhan_xet_san_pham (id_nguoi_dung, id_don_hang, id_san_pham, danh_gia, noi_dung, anh_mo_ta, video_mo_ta, kich_co_sp, thoi_gian_nx) VALUES ?`;
          connection.query(query, [danh_gia_sp], (err, results) => {
            if (err)
              return res.status(500).json({
                status: 500,
                isError: true,
                Object: err,
              });
            res.status(200).json({
              status: 200,
              isError: false,
              Object: "Đánh giá đơn thành công.",
            });
          });
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //GET DETAIL RATE ORDER
  getDetailRate: async (req, res) => {
    const { id_don_hang } = req.query;
    try {
      const query = `SELECT n.*, s.ten_san_pham, s.anh
      FROM nhan_xet_san_pham AS n
      LEFT JOIN san_pham AS s ON s.id = n.id_san_pham
      WHERE n.id_don_hang = ${id_don_hang}`;
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
          Object: results?.map((i) => ({
            ...i,
            anh_mo_ta: i.anh_mo_ta ? i.anh_mo_ta?.split(",") : [],
            video_mo_ta: i.video_mo_ta ? i.video_mo_ta?.split(",") : [],
          })),
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  //GET RATE PRODUCT
  getRateProduct: async (req, res) => {
    const { id_san_pham } = req.query;
    try {
      const query = `SELECT *
      FROM nhan_xet_san_pham
      WHERE id_san_pham = ${id_san_pham}`;
      //, AVG(danh_gia) AS danh_gia_trung_binh, COUNT(*) AS tong_danh_gia
      connection.query(query, (err, results) => {
        if (err)
          return res.status(500).json({
            status: 500,
            isError: true,
            Object: err,
          });
        const oneStar = results.filter((i) => i.danh_gia === 1);
        const twoStar = results.filter((i) => i.danh_gia === 2);
        const threeStar = results.filter((i) => i.danh_gia === 3);
        const fourStar = results.filter((i) => i.danh_gia === 4);
        const fiveStar = results.filter((i) => i.danh_gia === 5);
        res.status(200).json({
          status: 200,
          isError: false,
          Object: {
            danh_gia_trung_binh:
              results.reduce(
                (currentValue, i) => i.danh_gia + currentValue,
                0
              ) / results?.length,
            tong_danh_gia: results?.length,
            tong_1_sao: oneStar.length,
            tong_2_sao: twoStar.length,
            tong_3_sao: threeStar.length,
            tong_4_sao: fourStar.length,
            tong_5_sao: fiveStar.length,
          },
        });
      });
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
  getListRatingProduct: async (req, res) => {
    const {
      id_san_pham,
      starRating = 0,
      currentPage = 1,
      pageSize = 1000,
    } = req.body;
    const startIndex = (currentPage - 1) * pageSize;

    try {
      connection.query(
        `SELECT COUNT(*) AS total FROM nhan_xet_san_pham WHERE id_san_pham = ${id_san_pham}  ${
          !!starRating ? `AND danh_gia = ${starRating}` : ""
        }`,
        (err, countResult) => {
          if (err)
            return res.status(500).json({
              status: 500,
              isError: true,
              Object: err,
            });
          const total = countResult[0].total;
          const query = `SELECT nx.*, n.avatar, n.ho_ten
          FROM nhan_xet_san_pham AS nx
          LEFT JOIN nguoi_dung AS n ON n.id = nx.id_nguoi_dung
          WHERE id_san_pham = ${id_san_pham} ${
            !!starRating ? `AND danh_gia = ${starRating}` : ""
          } LIMIT ${startIndex}, ${parseInt(pageSize)}`;
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
                total,
                data: results.map((i) => ({
                  ...i,
                  anh_mo_ta: !!i.anh_mo_ta ? i.anh_mo_ta.split(",") : [],
                  video_mo_ta: !!i.video_mo_ta ? i.video_mo_ta.split(",") : [],
                })),
              },
            });
          });
        }
      );
    } catch (error) {
      res.status(500).json(error.message);
    }
  },
};

module.exports = rateController;
