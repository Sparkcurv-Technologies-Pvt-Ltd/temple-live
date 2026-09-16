import React, { useEffect, useState } from "react";
import FirstLogo from "../../../assets/images/amman.jpg";
import { CustomCardView } from "@components/others";
import { useSelector } from "react-redux";
import { selectManagementDetails } from "@modules/Management/ManagementSlice";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { BsGrid3X3Gap, BsImage } from "react-icons/bs";
import { Tooltip } from "antd";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import { FaUsers, FaSkullCrossbones, FaRing, FaPiggyBank } from "react-icons/fa";
import { MdWarning, MdAccountBalance } from "react-icons/md";

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  border: 1px solid #d9cfc7;
  border-radius: 6px;
  overflow: hidden;
`

const ToggleBtn = styled.button`
  background: ${p => p.active ? '#800000' : '#fff'};
  color: ${p => p.active ? '#fff' : '#800000'};
  border: none;
  padding: 6px 11px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: background 0.15s;
  &:hover { background: ${p => p.active ? '#800000' : '#f9f0f0'}; }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px;
  padding: 8px 0 4px;
`

const StatCard = styled.div`
  background: #fff;
  border: 1px solid #f0e6d3;
  border-radius: 12px;
  padding: 20px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(128,0,0,0.06);
  cursor: ${p => p.clickable ? 'pointer' : 'default'};
  transition: transform 0.16s, box-shadow 0.16s;
  &:hover { ${p => p.clickable ? 'transform: translateY(-2px); box-shadow: 0 6px 18px rgba(128,0,0,0.12); border-color: #800000;' : ''} }
`

const IconBubble = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: ${p => p.bg || '#fff3e0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: ${p => p.color || '#800000'};
  flex-shrink: 0;
`

const StatInfo = styled.div`
  flex: 1;
`

const StatValue = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: #2d1a0e;
  line-height: 1.1;
`

const StatLabel = styled.div`
  font-size: 12px;
  color: #7a6652;
  margin-top: 3px;
  font-weight: 500;
`

const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #800000;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 18px 0 8px;
  border-bottom: 1px solid #f0e6d3;
  padding-bottom: 4px;
`

const HomeView = () => {

  const navigate = useNavigate();
  const ManagementDetails = useSelector(selectManagementDetails);
  const [viewMode, setViewMode] = useState("image"); // 'image' | 'stats'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (stats) return; // already loaded
    setLoading(true);
    try {
      const [alive, death, marriage, chitFunds, penalty] = await Promise.all([
        request.get(APIURLS.GET_ALL_MEMBERS).catch(() => ({ data: [] })),
        request.get(APIURLS.GET_DEATH_MEMBER_LIST).catch(() => ({ data: [] })),
        request.get(APIURLS.GET_MARRIAGE_REMOVE_MEMBER_LIST).catch(() => ({ data: [] })),
        request.get(APIURLS.PROFIT_CHITFUND_DETAILS).catch(() => ({ data: [] })),
        request.get(APIURLS.PENALTY_SUMMARY).catch(() => ({ data: {} })),
      ]);
      setStats({
        activeMembers: Array.isArray(alive.data) ? alive.data.length : 0,
        deathMembers: Array.isArray(death.data) ? death.data.length : 0,
        marriageRemoved: Array.isArray(marriage.data) ? marriage.data.length : 0,
        chitFunds: Array.isArray(chitFunds.data) ? chitFunds.data.length : 0,
        pendingPenalty: penalty.data?.total_pending_penalty || 0,
        penaltyCount: penalty.data?.with_penalty || 0,
      });
    } catch (e) {
      console.error("Dashboard stats error:", e);
    }
    setLoading(false);
  };

  const handleToggle = (mode) => {
    setViewMode(mode);
    if (mode === 'stats') fetchStats();
  };

  const fmt = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  const fmtAmt = (n) => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <CustomCardView>
      {/* Toggle header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <ViewToggle>
          <Tooltip title="Image View">
            <ToggleBtn active={viewMode === 'image'} onClick={() => handleToggle('image')} data-testid="dash-toggle-image">
              <BsImage />
            </ToggleBtn>
          </Tooltip>
          <Tooltip title="Stats Overview">
            <ToggleBtn active={viewMode === 'stats'} onClick={() => handleToggle('stats')} data-testid="dash-toggle-stats">
              <BsGrid3X3Gap />
            </ToggleBtn>
          </Tooltip>
        </ViewToggle>
      </div>

      {/* Image view */}
      {viewMode === 'image' && (
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
          <img
            src={FirstLogo}
            alt="Temple"
            style={{ maxWidth: "100%", maxHeight: "calc(100vh - 220px)", width: "auto", height: "auto", objectFit: "contain", borderRadius: 8 }}
          />
        </div>
      )}

      {/* Stats view */}
      {viewMode === 'stats' && (
        <div>
          <SectionTitle>Members</SectionTitle>
          <StatsGrid>
            <StatCard clickable onClick={() => navigate('/MemberList')} data-testid="stat-active-members">
              <IconBubble bg="#e8f5e9" color="#2e7d32"><FaUsers /></IconBubble>
              <StatInfo>
                <StatValue>{loading ? '…' : fmt(stats?.activeMembers ?? 0)}</StatValue>
                <StatLabel>Active Members</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard clickable onClick={() => navigate('/MemberList')} data-testid="stat-death-members">
              <IconBubble bg="#f3e5f5" color="#6a1b9a"><FaSkullCrossbones /></IconBubble>
              <StatInfo>
                <StatValue>{loading ? '…' : fmt(stats?.deathMembers ?? 0)}</StatValue>
                <StatLabel>Death Members</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard clickable onClick={() => navigate('/MemberList')} data-testid="stat-marriage-removed">
              <IconBubble bg="#fce4ec" color="#c62828"><FaRing /></IconBubble>
              <StatInfo>
                <StatValue>{loading ? '…' : fmt(stats?.marriageRemoved ?? 0)}</StatValue>
                <StatLabel>Marriage Removed</StatLabel>
              </StatInfo>
            </StatCard>
          </StatsGrid>

          <SectionTitle>Finance</SectionTitle>
          <StatsGrid>
            <StatCard clickable onClick={() => navigate('/ChitFundDetails')} data-testid="stat-chit-funds">
              <IconBubble bg="#fff8e1" color="#C5A059"><FaPiggyBank /></IconBubble>
              <StatInfo>
                <StatValue>{loading ? '…' : fmt(stats?.chitFunds ?? 0)}</StatValue>
                <StatLabel>Active Chit Funds</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard clickable onClick={() => navigate('/PendingPenaltyList')} data-testid="stat-pending-penalty">
              <IconBubble bg="#ffebee" color="#c62828"><MdWarning /></IconBubble>
              <StatInfo>
                <StatValue style={{ fontSize: 18 }}>{loading ? '…' : fmtAmt(stats?.pendingPenalty ?? 0)}</StatValue>
                <StatLabel>Pending Penalty ({loading ? '…' : fmt(stats?.penaltyCount ?? 0)} records)</StatLabel>
              </StatInfo>
            </StatCard>
            <StatCard clickable onClick={() => navigate('/CollectionUserList')} data-testid="stat-collection">
              <IconBubble bg="#e3f2fd" color="#1565c0"><MdAccountBalance /></IconBubble>
              <StatInfo>
                <StatValue style={{ fontSize: 15 }}>Collections</StatValue>
                <StatLabel>View collection history</StatLabel>
              </StatInfo>
            </StatCard>
          </StatsGrid>
        </div>
      )}
    </CustomCardView>
  );
};

export default HomeView;
