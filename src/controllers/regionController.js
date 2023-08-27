const connection = require("../config/connectDB");

const regionController = {
  //GET LIST PROVINCE
  getListProvince: async (req, res) => {
    const { parentID = "0" } = req.query;
    try {
      const query = `SELECT * FROM tinh_thanh_pho`;
      connection.query(query, (err, results) => {
        let data;
        if (err) {
          data = {
            status: 500,
            isError: true,
            isOk: false,
            Object: "Lỗi truy vấn cơ sở dữ liệu",
          };
          res.status(500).json(data);
        } else {
          data = {
            status: 200,
            isError: false,
            isOk: true,
            Object: results,
          };
          res.status(200).json(data);
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //GET LIST DISTRICT
  getListDistrict: async (req, res) => {
    const { provinceID = "0" } = req.query;
    try {
      const query = `SELECT * FROM quan_huyen WHERE parentID = '${provinceID}'`;
      connection.query(query, (err, results) => {
        let data;
        if (err) {
          data = {
            status: 500,
            isError: true,
            isOk: false,
            Object: "Lỗi truy vấn cơ sở dữ liệu",
          };
          res.status(500).json(data);
        } else {
          data = {
            status: 200,
            isError: false,
            isOk: true,
            Object: results,
          };
          res.status(200).json(data);
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
  //GET LIST WARD
  getListWard: async (req, res) => {
    const { districtID = "0" } = req.query;
    try {
      const query = `SELECT * FROM xa_phuong WHERE parentID = '${districtID}'`;
      connection.query(query, (err, results) => {
        let data;
        if (err) {
          data = {
            status: 500,
            isError: true,
            isOk: false,
            Object: "Lỗi truy vấn cơ sở dữ liệu",
          };
          res.status(500).json(data);
        } else {
          data = {
            status: 200,
            isError: false,
            isOk: true,
            Object: results,
          };
          res.status(200).json(data);
        }
      });
    } catch (err) {
      res.status(500).json(err.message);
    }
  },
};

module.exports = regionController;
