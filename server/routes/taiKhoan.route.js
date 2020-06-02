const express = require("express");
const route = express.Router();
const taiKhoanController = require("../controllers/taiKhoan.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const base_uri = "/taiKhoan";

/**
 * {
"tenDangNhap":"DarkWalker" ,
"matKhau": "123456"
}
 */
route.post(base_uri + "/login", taiKhoanController.login);

/**
{
"tenTaiKhoan": "Lê Đình Thảo",
"tenDangNhap":"DarkWalker" ,
"matKhau": "123456",
"ngaySinh": "10/13/1998",
"CMND": "013509993",
"ngayCap": "2012",
"noiCap": "Hà Nội",
"diaChi": "Hà Nội",
"soDienThoai": "0977098873",
"email": "thaole4416@gmail.com"
}
 */
route.post(base_uri + "/register", taiKhoanController.register);
/*
{
  "id": 1586961656748,
  "newPassword" : 123456
}
*/
route.post(base_uri + "/changePassword", taiKhoanController.changePassword);

route.get(
  base_uri + "/",
  authMiddleware.tokenCheck,
  taiKhoanController.getAll
);

route.get(
  base_uri + "/getInfo",
  authMiddleware.tokenCheck,
  taiKhoanController.getInfo
);
route.get(
  base_uri + "/test",
  taiKhoanController.test
);

route.delete(
  base_uri + "/",
  taiKhoanController.clearAll
);

module.exports = route;
