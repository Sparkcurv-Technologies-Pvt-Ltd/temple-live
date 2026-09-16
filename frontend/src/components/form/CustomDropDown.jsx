
import React, { Fragment } from 'react';
import { Dropdown as AntdDropdown } from 'antd';
import styled from 'styled-components';

const AntdDropdownStyle = styled(AntdDropdown.Button)`
    &.ant-space-compact-block{
        justify-content:${props => props.flex || 'start'}
    }

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

const CustomDropDown = ({ type, icon, onClick, title, titleicon, menu, trigger, flex }) => {

    const dropdowntitle = (
        <Fragment>
            {titleicon} {title}
        </Fragment>
    );

    return (
        <AntdDropdownStyle
            type={type}
            menu={menu}
            onClick={onClick}
            icon={icon}
            flex={flex}
            trigger={trigger}>
            {dropdowntitle}
        </AntdDropdownStyle>
    )
};

export default CustomDropDown

// ===================  Usage of Drop Down  =============


// import { CustomDropDown } from '../../Components/Form/CustomDropDown'
// import { MoreOutlined, UserOutlined } from '@ant-design/icons'

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
//     {
//         label: '3rd menu item',
//         key: '3',
//         danger: true,
//     },
//     {
//         label: '4rd menu item',
//         key: '4',
//         danger: true,
//         disabled: true,
//     },
// ];
// const menuProps = {
//     items,
//     onClick: handleMenuClick,
// };

// <CustomDropDown
//     type={'primary'}
//     menu={menuProps}
//     icon={<MoreOutlined />}
//     trigger={['click']}
//     title={'vijay'}
//     titleicon={<UserOutlined />}
// />