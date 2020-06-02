import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { connect } from "react-redux";
import {
  setStocks,
  order,
  genOtp,
  verifyOtp,
  changeExchange,
} from "../../redux/index";
import { emitter } from "../../emitter";
import OrderPopup from "../popup/order.popup";
import SkyLight from "react-skylight";
import { getAll } from "../../services/userService";
import HistoryPopup from "../popup/history.popup";
import OtpPopup from "../popup/otp.popup";
import axios from "axios";
import { BASE_URL } from "../../constants";
const socket = socketIOClient();
console.log("O day",process.env.PORT)
class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exchange: "HOSE",
      order: {},
    };
  }

  listenEvent = () => {
    socket.on(`getStocks`, (stocksData) => {
      this.props.setStocks(stocksData);
      emitter.emit("loadingStocks", true);
    });
    emitter.on(`verifySuccess`, () => {
      this.props.order(this.state.order);
    });
  };

  initData = () => {
    getAll();
  };

  changeExchange = (exchange) => {
    this.setState({ exchange: exchange });
    this.props.changeExchange(exchange);
    localStorage.setItem("activeExchange", exchange);
    socket.emit(`getExchangeData`);
    emitter.emit("loadingStocks", false);
  };

  componentDidMount() {
    this.listenEvent();
    setTimeout(() => {
      console.log("get exchange data");
      socket.emit(`getExchangeData`);
    }, 1000);
  }

  checkOtpCode = (order) => {
    this.otpPopup.show();
    // this.props.genOtp(this.props.user.token);
    this.setState({ order });
  };

  verifyOtp = (otpCode, event) => {
    event.preventDefault();
    emitter.emit(`verifySuccess`);
    // this.props.verifyOtp({ otpCode: otpCode, token: this.props.user.token });
  };

  reSendOtp() {
    this.props.genOtp(this.props.user.token);
  }

  test = async () => {
    let x =  await axios({
      method: "GET",
      url: BASE_URL + "/taiKhoan/test",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
    alert(x);
  }

  componentWillUnmount() {}

  render() {
    let otpPopupStyle = {
      backgroundColor: "rgb(33,32,39)",
      width: "30%",
      marginLeft: "-35%",
      left: "70%",
    };
    let orderPopupStyle = {
      width: "25%",
      minHeight: "400px",
      position: "fixed",
      top: "35%",
      left: "100%",
      height: "100%",
      marginTop: "-200px",
      marginLeft: "-25%",
      backgroundColor: "rgb(33,32,39)",
      color: "white",
      font: "roboto",
      fontSize: "1rem",
      padding: 0,
    };
    let historyPopupStyle = {
      width: "25%",
      minHeight: "400px",
      position: "fixed",
      top: "35%",
      left: "100%",
      height: "100%",
      marginTop: "-200px",
      marginLeft: "-25%",
      backgroundColor: "rgb(33,32,39)",
      color: "white",
      font: "roboto",
      fontSize: "1rem",
      padding: 0,
    };
    const exchange =
      localStorage.getItem("activeExchange") || this.state.exchange;
    return (
      <div className="menu">
        {/* <input type="text" className="input" placeholder="Nhập mã CP" />
        <button className="add button-menu">
          <i className="fas fa-plus"></i>
        </button> */}

        <button
          className={`btn-menu ${exchange === "HOSE" ? "active" : ""}`}
          onClick={() => this.changeExchange("HOSE")}
        >
          HOSE
        </button>
        <button
          className={`btn-menu ${exchange === "HNX" ? "active" : ""}`}
          onClick={() => this.changeExchange("HNX")}
        >
          HNX
        </button>
        <button
          className={`btn-menu ${exchange === "UPCOM" ? "active" : ""}`}
          onClick={() => this.changeExchange("UPCOM")}
        >
          UPCOM
        </button>
        <button
          className="btn-menu order"
          onClick={() => this.test()}
        >
          Lịch sử GD
          {/* <i className="fas fa-book"></i> */}
        </button>
        <button
          className="btn-menu order"
          onClick={() => this.historyPopup.show()}
        >
          Danh mục
          {/* <i className="fas fa-book"></i> */}
        </button>
        <button
          className="btn-menu order"
          onClick={() => this.orderPopup.show()}
        >
          Đặt lệnh
          {/* <i className="fas fa-plus"></i> */}
        </button>
        <SkyLight
          dialogStyles={orderPopupStyle}
          hideOnOverlayClicked
          ref={(ref) => (this.orderPopup = ref)}
          title="Đặt lệnh"
        >
          <OrderPopup callback={this.checkOtpCode} />
        </SkyLight>
        <SkyLight
          dialogStyles={historyPopupStyle}
          hideOnOverlayClicked
          ref={(ref) => (this.historyPopup = ref)}
          title="Sổ lệnh"
        >
          <HistoryPopup />
        </SkyLight>
        <SkyLight
          dialogStyles={otpPopupStyle}
          hideOnOverlayClicked
          ref={(ref) => (this.otpPopup = ref)}
          title="Check mã OTP"
        >
          <OtpPopup
            verifyOtp={this.verifyOtp}
            reSendOtp={this.reSendOtp}
            otp={this.props.otp}
          />
        </SkyLight>
      </div>
    );
  }
}

const mapStateToProps = ({ stocks, user, otp }) => ({
  stocks: stocks,
  user: user,
  otp: otp,
});

const mapDispatchToProps = (dispatch) => ({
  setStocks: (stocksData) => {
    dispatch(setStocks(stocksData));
  },
  order: (payload) => dispatch(order(payload)),
  genOtp: (payload) => dispatch(genOtp(payload)),
  verifyOtp: (payload) => dispatch(verifyOtp(payload)),
  changeExchange: (exchange) => dispatch(changeExchange(exchange)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Menu);
