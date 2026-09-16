import React, { Fragment, useLayoutEffect } from "react";
import GlobalStyle from "@theme/GlobalStyle";
import { useLocation } from "react-router-dom";
import Routers from "./router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { selectCurrentToken } from "@modules/Auth/authSlice";
import { useSelector } from "react-redux";
import { ConfigProvider } from "antd";

const antdTheme = {
  token: {
    colorPrimary: "#800000",
    colorSuccess: "#15803D",
    colorWarning: "#B45309",
    colorError: "#B91C1C",
    colorInfo: "#0369A1",
    colorTextBase: "#1E293B",
    colorBgBase: "#FFFFFF",
    colorBgLayout: "#FAF8F5",
    colorBgContainer: "#FFFFFF",
    colorBorder: "#E2D9CC",
    colorBorderSecondary: "#EFE8DC",
    borderRadius: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 14,
    controlHeight: 38,
  },
  components: {
    Table: { headerBg: "#EFEAE1", headerColor: "#1E293B", rowHoverBg: "#FAF3E8", borderColor: "#E2D9CC" },
    Button: { fontWeight: 600, borderRadius: 6 },
    Card: { colorBorderSecondary: "#E2D9CC" },
    Input: { hoverBorderColor: "#800000", activeBorderColor: "#800000" },
    Select: { colorBorder: "#CBD5E1" },
    Menu: { darkItemBg: "#2A0407", darkSubMenuItemBg: "#1E0205" },
  },
};

function App() {
  const location = useLocation();
  const token = useSelector(selectCurrentToken);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ConfigProvider theme={antdTheme}>
      <Fragment>
        <GlobalStyle />
        <Routers token={token} />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Fragment>
    </ConfigProvider>
  );
}

export default App;
