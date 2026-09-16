import React, { useState } from 'react'
import { Table as AntdTable, Pagination as AntdPagination, Popover, Flex, Checkbox } from 'antd';
import styled from 'styled-components';
import { THEME } from '@theme/index';
import { PlusCircleOutlined } from '@ant-design/icons';
const CustomTable = ({ columns, data, footer, components, pagination, rowKey, removePagination }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const itemRender = (_, type, originalElement) => {
        if (type === 'prev') {
            return <a>Previous</a>;
        }
        if (type === 'next') {
            return <a>Next</a>;
        }
        return originalElement;
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const handlePageSizeChange = (current, Infinity) => {
        setPageSize(Infinity);
    };
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const displayedData = data?.slice(startIndex, endIndex);

    const getRowClassName = (record, index) => {
        if (record.lease_completed_colour_change) {
            return 'row_color_change';
        }
        return index % 2 === 0 ? 'even-row' : 'odd-row';
    };
    
    const StyledPagination = styled.div`
    display: flex !important;
    justify-content: end !important;
    align-items: center;
    text-align: center;
    /* margin-top: 25px; */
    padding-bottom: 25px;
    /* margin-left: 20px; */
    .ant-pagination .ant-pagination-item a {
        display: contents !important;
}
  `

    return (
        <div style={{ maxWidth: '100%' }}>
            {
                !removePagination &&
                <StyledPagination>
                    <AntdPagination
                        // showQuickJumper
                        showSizeChanger
                        itemRender={itemRender}
                        pageSizeOptions={['10', '20', '50', '100']} // Customize page size options
                        total={data?.length} // Total number of items
                        // showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                        current={currentPage}
                        pageSize={pageSize}
                        onChange={handlePageChange}
                        onShowSizeChange={handlePageSizeChange}
                    />
                </StyledPagination>
            }
            <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
                <StyledTable
                    footer={footer}
                    columns={columns}
                    dataSource={displayedData}
                    rowKey={rowKey}
                    components={components}
                    bordered={true}
                    pagination={false}
                    rowClassName={getRowClassName}
                    onChange={(pagination, filters, sorter) => {
                        const { columnKey, order } = sorter;
                        // Update the data array based on the sorting criteria and direction
                        const sortedData = [...data];
                        sortedData.sort((a, b) => {
                            const aValue = a[columnKey];
                            const bValue = b[columnKey];
                            if (typeof aValue === 'string' && typeof bValue === 'string') {
                                return order === 'ascend' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                            }
                            // If the values are numeric, you can compare them as numbers
                            return order === 'ascend' ? aValue - bValue : bValue - aValue;
                        });
                    }}
                />
            </div>
        </div>
    )
}
export default CustomTable
export const DeleteButtonWrapper = styled.div`
        opacity: 0;
        transition:0.5s;
    `;
const StyledTable = styled(AntdTable)`

.ant-table-tbody > tr.even-row {
        background: ${THEME.white}; 
    }
    .ant-table-tbody > tr.odd-row {
        background: ${THEME.table_nthchild}; 
    }
    .ant-table-tbody > tr.row_color_change {
        /* background-color: grey;  */
        padding:10px;
        color: red; 
    }
    .ant-table-tbody > tr.row_color_change > td {
        color: red; 
    }
    .ant-table-tbody > tr.row_color_change > td:last-child {
        /* background-color: grey;  */
        padding:10px;
    }
table,th,td{
    border:1px solid #BFBFBF;
    border-radius:0;
}
table tr td:first-child {
  border-left: 0;
}
    tr{
    transition:0.5s;
    }
    tr:hover ${DeleteButtonWrapper} {
        opacity: 1;
    }
     .ant-table-thead {
        background: ${THEME.white} !important;
    }
    & .ant-table-thead > tr >th{
        color: ${THEME.table_head} !important;
        letter-spacing: 1px;
        color: #000;
        text-align:center !important;
        font-weight: 800;
        font-size: 16px;
        background: transparent;
        cursor: pointer;
        border-top: 0;
    }
    .ant-table-tbody >tr >td {
        /* border-style: double; */
        color: ${THEME.black};
        text-align: center !important;
        /* font-weight: 600; */
        font-size:  14px;
    }
    .ant-table-tbody >tr  {
        color: ${THEME.table_content};
        background: #fff;
    }
    /* ========== nth child ========= */
    /* .ant-table-tbody > tr.even-row {
    background:${THEME.white};
  }
  .ant-table-tbody > tr.odd-row {
    background: ${THEME.table_nthchild};
  } */
      /* ========== nth child ========= */
    .ant-table-tbody>tr>td, :where(.css-dev-only-do-not-override-190m0jy).ant-table-wrapper tfoot>tr>th, :where(.css-dev-only-do-not-override-190m0jy).ant-table-wrapper tfoot>tr>td {
    position: relative;
    padding: 12px 12px !important;
    overflow-wrap: break-word;
}
.ant-pagination .ant-pagination-item a {
        display: contents !important;
}
.ant-table-container table>thead>tr:first-child >*:last-child {
    border-start-end-radius: 0px;
}
.ant-table-container table>thead>tr:first-child >*:first-child {
    border-start-start-radius: 0px;
}
.ant-table-thead >tr>th{
    border-inline-end: 3px solid #eee;
}
`;