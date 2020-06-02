const TaiKhoan = require("../models/taiKhoan.model");
const SoDuTien = require("../models/soDuTien.model");
const bcrypt = require("../helpers/bcrypt");
const jwt = require("jsonwebtoken");
const tokenList = {};
const RandomHelper = require("../helpers/random");

let getAll = (req, res) => {
  console.log(req.userInfo);
  TaiKhoan.find()
    .then((SanGiaoDich) => res.json(SanGiaoDich))
    .catch((err) => res.status(400).json("Error: " + err));
};

let login = async (req, res) => {
  let tenDangNhap = req.body.tenDangNhap;
  let matKhau = req.body.matKhau;
  let taiKhoan = await TaiKhoan.findOne({
    tenDangNhap: tenDangNhap,
  });
  if (taiKhoan) {
    let checkPassword = await bcrypt.compare(matKhau, taiKhoan.matKhau);
    if (checkPassword) {
      const user = {
        id: taiKhoan._id,
        email: taiKhoan.email,
        username: tenDangNhap,
      };
      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFE,
      });

      const refreshToken = jwt.sign(user, process.env.REFRESH_JWT_SECRET, {
        expiresIn: process.env.REFRESH_JWT_LIFE,
      });

      tokenList[refreshToken] = user;

      res.json({
        status: "OK",
        message: "Đăng nhập thành công",
        data: {
          id: taiKhoan._id,
          username: taiKhoan.tenTaiKhoan,
          token: token,
          refreshToken: refreshToken,
        },
      });
    } else {
      res.json({ status: "FAIL", message: "Mật khẩu không đúng" });
    }
  } else {
    res.json({ status: "FAIL", message: "Tên đăng nhập không tồn tại" });
  }
};

async function register(req, res) {
  const lastestAcc = await TaiKhoan.find().sort({ _id: -1 });
  console.log(lastestAcc);
  let id = RandomHelper.autoId(lastestAcc[0]._id);
  let tenTaiKhoan = req.body.tenTaiKhoan;
  let tenDangNhap = req.body.tenDangNhap;
  let matKhau = req.body.matKhau;
  let ngaySinh = req.body.ngaySinh;
  let CMND = req.body.CMND;
  let ngayCap = req.body.ngayCap;
  let noiCap = req.body.noiCap;
  let diaChi = req.body.diaChi;
  let soDienThoai = req.body.soDienThoai;
  let email = req.body.email;

  let hashNewPassword = await bcrypt.hash(matKhau);
  let errs = [];
  if (!CMND.match(/^(\d{9}|\d{12})$/)) errs.push("CMND không hợp lệ");
  if (!email.match(/\S+@\S+\.\S+/)) errs.push("Email không hợp lệ");
  let checkTenDangNhap = await TaiKhoan.find({ tenDangNhap: tenDangNhap });
  if (checkTenDangNhap) errs.push("Tên đăng nhập dã tồn tại");

  let checkCMND = await TaiKhoan.find({ CMND: CMND });
  if (checkCMND) errs.push("CMND dã tồn tại");

  let checkSDT = await TaiKhoan.find({ soDienThoai: soDienThoai });
  if (checkSDT) errs.push("Số điện thoại dã tồn tại");

  let checkEmail = await TaiKhoan.find({ email: email });
  if (checkEmail) errs.push("Email dã tồn tại");

  console.log(errs);
  if (!errs.length) {
    var taiKhoan = new TaiKhoan({
      _id: id,
      tenTaiKhoan: tenTaiKhoan,
      tenDangNhap: tenDangNhap,
      matKhau: hashNewPassword,
      ngaySinh: ngaySinh,
      CMND: CMND,
      ngayCap: ngayCap,
      noiCap: noiCap,
      diaChi: diaChi,
      soDienThoai: soDienThoai,
      email: email,
      createdTime: Date.now(),
    });
    taiKhoan
      .save()
      .then((doc) => res.json(doc))
      .catch((err) => res.status(400).json("Error: " + err));
  } else {
    res.json({ status: "FAIL", message: errs });
  }
}

let changePassword = async (req, res) => {
  let _id = req.body.id;
  let newPassword = req.body.newPassword;
  let hashNewPassword = await bcrypt.hash(newPassword);
  TaiKhoan.findByIdAndUpdate(_id, { matKhau: hashNewPassword })
    .then((data) => res.json(data))
    .catch((err) => res.json("Error: " + err));
};

/**
 * Lấy mã token mới sử dụng Refresh token
 * POST /refresh_token
 */
// router.post('/refresh_token', async (req, res) => {
//   // User gửi mã Refresh token kèm theo trong body
//   const { refreshToken } = req.body;

//   // Kiểm tra Refresh token có được gửi kèm và mã này có tồn tại trên hệ thống hay không
//   if ((refreshToken) && (refreshToken in tokenList)) {

//     try {
//       // Kiểm tra mã Refresh token
//       await utils.verifyJwtToken(refreshToken, config.refreshTokenSecret);

//       // Lấy lại thông tin user
//       const user = tokenList[refreshToken];

//       // Tạo mới mã token và trả lại cho user
//       const token = jwt.sign(user, config.secret, {
//         expiresIn: config.tokenLife,
//       });
//       const response = {
//         token,
//       }
//       res.status(200).json(response);
//     } catch (err) {
//       console.error(err);
//       res.status(403).json({
//         message: 'Invalid refresh token',
//       });
//     }
//   } else {
//     res.status(400).json({
//       message: 'Invalid request',
//     });
//   }
// });

let getInfo = async (req, res) => {
  let _id = req.userInfo.id;
  let taiKhoan = await TaiKhoan.findOne({ _id: _id });
  console.log(taiKhoan);
  let soDu = await SoDuTien.findOne({ maTaiKhoan: _id });
  console.log(soDu);
  res.json({ status: "OK", data: { ...taiKhoan._doc, soDu: soDu.soDu } });
};
function clearAll(req, res) {
  TaiKhoan.deleteMany()
    .then((lenh) => res.json(lenh))
    .catch((err) => res.status(400).json("Error: " + err));
}
async function test(req, res) {
  const user = {
    id: "29A0000001",
    email: "thanhpd@gmail.com",
    username: "Phạm Đức Thành",
  };
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFE,
  });

  const refreshToken = jwt.sign(user, process.env.REFRESH_JWT_SECRET, {
    expiresIn: process.env.REFRESH_JWT_LIFE,
  });
  var x = JSON.stringify({
    id: "29A0000001",
    username: "Phạm Đức Thành",
    token: token,
    refreshToken: refreshToken,
  })
  console.log("x:",x)
  try {
    res.cookie(
      "userInfo",
      `${x}`,
      { maxAge: 900000}
    );
    res.send("");
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  login: login,
  register: register,
  getAll: getAll,
  changePassword: changePassword,
  getInfo: getInfo,
  clearAll: clearAll,
  test: test,
  //   viewProfile: viewProfile,
};
