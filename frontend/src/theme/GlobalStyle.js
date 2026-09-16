import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* Ant Design overrides */
  .ant-form-item {
    margin-bottom: 16px !important;
  }

  .ant-form label {
    font-weight: 600 !important;
    font-size: 13px !important;
    color: #334155 !important;
  }

  .ant-layout {
    background: #FAF8F5 !important;
  }

  .ant-layout-content {
    background: #FAF8F5 !important;
  }

  .ant-drawer .ant-drawer-body {
    padding: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto ! important;
    background: #2A0407 !important;
  }

  .ant-drawer .ant-drawer-header {
    background: #1E0205 !important;
    border-bottom: 1px solid rgba(197,160,89,0.15) !important;
  }

  .ant-drawer .ant-drawer-title {
    color: #C5A059 !important;
  }

  /* Card styling */
  .ant-card {
    border-radius: 12px !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06) !important;
    border: 1px solid #E2D9CC !important;
  }

  .ant-card .ant-card-head {
    border-bottom: 1px solid #EFE8DC !important;
    font-weight: 700 !important;
    color: #1E293B !important;
    font-size: 15px !important;
  }

  /* Table */
  .ant-table-wrapper .ant-table-thead > tr > th {
    background: #EFEAE1 !important;
    color: #1E293B !important;
    font-weight: 700 !important;
    font-size: 13px !important;
    border-bottom: 2px solid #E2D9CC !important;
    letter-spacing: 0.01em;
  }

  .ant-table-wrapper .ant-table-tbody > tr:hover > td {
    background: #FAF3E8 !important;
  }

  .ant-table-wrapper .ant-table {
    border-radius: 12px !important;
    overflow: hidden;
    border: 1px solid #E2D9CC !important;
  }

  /* Buttons */
  .ant-btn-primary {
    background: #800000 !important;
    border-color: #800000 !important;
    font-weight: 600 !important;
    box-shadow: 0 2px 6px rgba(128,0,0,0.25) !important;
    transition: all 0.2s !important;
  }

  .ant-btn-primary:hover {
    background: #a31c1c !important;
    border-color: #a31c1c !important;
    box-shadow: 0 4px 12px rgba(128,0,0,0.35) !important;
    transform: translateY(-1px);
  }

  .ant-btn-default:hover {
    border-color: #800000 !important;
    color: #800000 !important;
  }

  /* Input focus */
  .ant-input:focus, .ant-input-focused,
  .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused {
    border-color: #800000 !important;
    box-shadow: 0 0 0 2px rgba(128,0,0,0.1) !important;
  }

  .ant-input:hover, .ant-input-affix-wrapper:hover {
    border-color: #a31c1c !important;
  }

  .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
    border-color: #800000 !important;
  }

  .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-color: #800000 !important;
    box-shadow: 0 0 0 2px rgba(128,0,0,0.1) !important;
  }

  /* Picker */
  .ant-picker:hover {
    border-color: #800000 !important;
  }

  .ant-picker-focused {
    border-color: #800000 !important;
    box-shadow: 0 0 0 2px rgba(128,0,0,0.1) !important;
  }

  /* Tabs */
  .ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #800000 !important;
    font-weight: 700 !important;
  }

  .ant-tabs .ant-tabs-ink-bar {
    background: #800000 !important;
  }

  .ant-tabs .ant-tabs-tab:hover {
    color: #a31c1c !important;
  }

  /* Tag colors */
  .ant-tag-green { background: #dcfce7 !important; border-color: #86efac !important; color: #15803d !important; }
  .ant-tag-red { background: #fee2e2 !important; border-color: #fca5a5 !important; color: #b91c1c !important; }
  .ant-tag-gold { background: #fef9c3 !important; border-color: #fde047 !important; color: #92400e !important; }

  /* Pagination */
  .ant-pagination .ant-pagination-item-active {
    background: #800000 !important;
    border-color: #800000 !important;
  }
  .ant-pagination .ant-pagination-item-active a {
    color: #fff !important;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(128,0,0,0.2); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(128,0,0,0.4); }

  .ant-input-affix-wrapper > input.ant-input {
    font-weight: 500 !important;
  }
`

export default GlobalStyle
