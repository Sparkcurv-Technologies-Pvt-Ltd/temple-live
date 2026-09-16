import React from "react";
import styled from "styled-components";
import { Flex } from "@components/others";
import { NavTopDraw, BtnProfile } from "@layout/Partials/Style";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@modules/Auth/authSlice";
import { MdMenu } from "react-icons/md";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { SvgIcons } from "@assets/Svg";

const PageTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1E293B;
  margin: 0;
  letter-spacing: -0.2px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  display: flex;
  align-items: center;
`;

const UserBadge = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #800000, #5A0000);
  color: #C5A059;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(128,0,0,0.3);
`;

const RoleBadge = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(128,0,0,0.08);
  color: #800000;
  border: 1px solid rgba(128,0,0,0.15);
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const CollapseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #64748B;
  font-size: 20px;
  transition: all 0.15s;
  padding: 0;

  &:hover {
    background: #F1EEE8;
    color: #800000;
  }
`;

export const NavHeader = ({ updateCollapse, showDrawer }) => {
  const user = useSelector(selectCurrentUser);
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "AD";

  return (
    <NavTopDraw>
      <Flex aligncenter="true" gap="14px">
        <CollapseBtn className="DrawBtn" onClick={showDrawer} aria-label="Open menu">
          <MdMenu />
        </CollapseBtn>
        <CollapseBtn
          style={{ display: 'flex' }}
          className="DesktopCollapse"
          onClick={updateCollapse}
          aria-label="Toggle sidebar"
        >
          <HiOutlineMenuAlt2 />
        </CollapseBtn>
        <PageTitle className="ResponMobile">
            <img src={SvgIcons.Logoimg} alt="logo" style={{ width: 28, height: 28, marginRight: 8, verticalAlign: 'middle', flexShrink: 0 }} />
            Temple Management System
          </PageTitle>
      </Flex>

      <div className="Btnresponsive">
        <RoleBadge>{user?.my_role || "Admin"}</RoleBadge>
        <BtnProfile data-testid="user-profile-btn">
          <UserBadge>{initials}</UserBadge>
          <h1 className="ResponMobile">{user?.username || "Admin"}</h1>
        </BtnProfile>
      </div>
    </NavTopDraw>
  );
};
