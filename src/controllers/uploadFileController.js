const connection = require("../config/connectDB");
const multer = require("multer");

let FileName;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, "uploads/");
    } else {
      cb(new Error("not image"), false);
    }
  },
  filename: (req, file, cb) => {
    FileName = Date.now() + "-" + file.originalname;
    cb(null, FileName);
  },
});

const upload = multer({ storage: storage });

const uploadFile = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(500).json({
        status: 200,
        Object: err,
        isOk: true,
        isError: true,
      });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    res.status(200).json({
      status: 200,
      Object: FileName,
      isOk: true,
      isError: true,
    });
  });
};

module.exports = { uploadFile };
