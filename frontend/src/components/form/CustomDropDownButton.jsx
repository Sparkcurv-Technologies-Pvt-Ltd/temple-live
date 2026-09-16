import React from 'react';
import { Button, Dropdown as AntdDropdown } from 'antd';
import styled from 'styled-components';
import { THEME } from '@theme/index';

const AntdDropdownStyle = styled(AntdDropdown)`
    border:none;
    
    & .ant-btn{
        height:auto;
    }
    
    & .ant-btn >span{
        font-size:.85rem;
        font-weight:600;
        text-transform:capitalize;
        letter-spacing: 1px;
    }

    &.ant-dropdown-menu .ant-dropdown-menu-title-content{
        font-size:1rem;
    }
`

const AntdMenuButton = styled(Button)`
  height: auto;
  padding: 10px;
  display: flex;
  background: ${(props) => (props.bgcolor ? props.bgcolor : "#fff")};
  color: ${(props) => (props.color ? props.color : "#000")};
  font-size: ${(props) => (props.size ? props.size : "20px")};
    
  &:hover,
  &:active,
  &:focus {
    color: ${THEME.primary} !important;
    border-color: ${THEME.primary} !important;
  }
`;

const CustomDropDownButton = ({ icon, menu, trigger, bgcolor,color, placement, text,size }) => {

    return (
        <AntdDropdownStyle menu={menu} trigger={trigger} placement={placement}>
            <AntdMenuButton bgcolor={bgcolor} color={color} type='default' size={size}>{text} {icon} 
            </AntdMenuButton>
        </AntdDropdownStyle>
    )
};

export default CustomDropDownButton

// ===================  Usage of DropDownButton ===============


// import { CustomDropDownButton } from '../../Components/Form/CustomDropDownButton'
// import { HiOutlineDotsVertical } from "react-icons/hi";

// const handleMenuClick = (e) => {
//     console.log('click', e);
// };

// const items = [
//     {
//         label: '1st menu item',
//         key: '1',
//     },
//     {
//         label: '2nd menu item',
//         key: '2',
//         danger: true,
//     },
// ];
// const menuProps = {
//     items,
//     onClick: handleMenuClick,
// };

// <CustomDropDownButton menu={menuProps} bgColor={'gray'} placement="bottomLeft" trigger={['click']} icon={<HiOutlineDotsVertical />} />
