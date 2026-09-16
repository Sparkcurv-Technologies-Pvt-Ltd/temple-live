import { Layout, Menu } from "antd";
import styled from "styled-components";

export const MainLayout = styled.section`
  min-height: 100vh;
  display: flex;
  width: 100%;
  overflow: hidden;
  background: var(--bg-app);
`;

export const ImageProfile = styled.div`
  cursor: pointer;
  & img {
    width: 44px;
    border-radius: 50%;
    border: 2px solid rgba(197,160,89,0.4);
  }
`;

export const MenuImageProfile = styled.div`
  width: 160px;
  height: 160px;
  background: #5A0000;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  transition: 0.3s;
  & img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
  &.active { width: 44px; height: 44px; }
`;

export const MenuHolder = styled.div`
  height: calc(100vh - 130px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

export const MenuBottom = styled.div`
  position: absolute;
  width: 100%;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 20px;
  background: rgba(0,0,0,0.25);
  border-top: 1px solid rgba(197,160,89,0.15);
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: rgba(197,160,89,0.15); }

  & svg { color: #C5A059 !important; font-size: 20px; margin-right: 10px; }
  & h1 { color: rgba(255,255,255,0.85); font-size: 14px; font-weight: 600; letter-spacing: 0.02em; }
`;

export const LogoutBottom = styled.div`
  position: absolute;
  width: 100%;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 20px;
  background: rgba(0,0,0,0.2);
  cursor: pointer;
  border-top: 1px solid rgba(197,160,89,0.15);
  gap: 10px;
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
  &:hover { background: rgba(197,160,89,0.15); }
`;

export const Profile = styled.div`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0 10px;
  gap: 10px;
  padding: 5px 20px;
`;

export const MenuText = styled.div`
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  padding: 8px 24px 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-size: 11px;
  margin-top: 6px;
`;

export const HeaderNav = styled.div`
  display: flex;
  align-items: center;
  padding: 18px 20px 14px;
  background: var(--sidebar-header);
  border-bottom: 1px solid rgba(197,160,89,0.15);
  min-height: 70px;
  gap: 10px;
  cursor: pointer;

  h3 {
    font-size: 22px;
    font-weight: 800;
    color: #C5A059;
    letter-spacing: -0.3px;
    white-space: nowrap;
    overflow: hidden;
    transition: all 0.2s;
    opacity: 1;
    width: auto;
    font-family: 'Plus Jakarta Sans', sans-serif;

    &.active {
      width: 0;
      opacity: 0;
      overflow: hidden;
    }
  }
`;

export const NavTopDraw = styled.div`
  height: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  width: 100%;

  .DrawBtn { cursor: pointer; }

  .Btnresponsive {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  @media (min-width: 901px) {
    .DrawBtn { display: none; }
  }
`;

export const SideMenuLayout = styled(Layout.Sider)`
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  background: var(--sidebar-bg) !important;
  box-shadow: 4px 0 24px rgba(0,0,0,0.25);

  @media (max-width: 900px) {
    display: none;
  }

  .ant-layout-sider-children {
    background: var(--sidebar-bg) !important;
    display: flex;
    flex-direction: column;
  }

  .ant-layout-sider-trigger {
    background: rgba(0,0,0,0.3) !important;
    border-top: 1px solid rgba(197,160,89,0.15);
  }
`;

export const TopHeader = styled(Layout.Header)`
  height: 66px !important;
  background: #fff !important;
  line-height: 1 !important;
  padding: 0 !important;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 0 #E2D9CC, 0 2px 8px rgba(0,0,0,0.05) !important;
  display: flex;
  align-items: center;
`;

export const ContentLayout = styled(Layout)`
  margin-left: ${(props) => (props.$collapsed ? '80px' : '280px')};
  min-height: 100vh;
  background: var(--bg-app) !important;
  transition: margin-left 0.2s ease-in-out;
  overflow-x: hidden;

  @media (max-width: 900px) {
    margin-left: 0;
    width: 100%;
    overflow-x: hidden;
  }
`;

export const BodyContent = styled(Layout.Content)`
  min-height: calc(100vh - 66px);
  overflow-y: auto;
  background: var(--bg-app) !important;

  @media (max-width: 900px) {
    width: 100% !important;
    margin: 0 !important;
  }
`;

export const AntdStyledMenu = styled(Menu)`
  position: absolute !important;
  right: 3px;
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08) !important;
  overflow: hidden;
  min-width: 160px;
  .ant-dropdown-menu-item { padding: 10px 16px !important; font-size: 14px; }
`;

export const BtnProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 40px;
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid transparent;

  & h1 {
    font-size: 14px;
    font-weight: 600;
    color: #1E293B;
    white-space: nowrap;
  }

  & svg { font-size: 1.3rem; color: #64748B; }

  &:hover {
    background: #F1EEE8;
    border-color: #E2D9CC;
  }
`;
