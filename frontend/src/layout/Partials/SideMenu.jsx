import { Menu } from "antd";
import { useLocation, useNavigate } from 'react-router-dom';
import { Fragment, useEffect, useState } from "react";
import { adminItems, adminKeys } from "@layout/Partials/DynamicSubmenu/Admin";
import { MenuHolder } from "@layout/Partials/Style";
import { useSelector } from "react-redux";
import { selectAllPermissions, selectCurrentSuperUser, selectCurrentUserRole } from "@modules/Auth/authSlice";
import { userRolesConfig } from "@router/config/roles";
import { userItems, userKeys } from "./DynamicSubmenu/User";
import { investorItem, investorKeys } from "./DynamicSubmenu/Investor";


export const SideMenu = ({ collapsed }) => {

    const navigate = useNavigate();

    const [openKeys, setOpenKeys] = useState([]);
    const [activeTab, setActiveTab] = useState('')

    // ==========  Dynamic Items & Keys
    const [dynamicKeys, setDynamicKeys] = useState([])
    const [items, setItems] = useState([])

    const route = useLocation()
    const role = useSelector(selectCurrentUserRole)
    const superUsers = useSelector(selectCurrentSuperUser)
    const permissionsGet = useSelector(selectAllPermissions)

    useEffect(() => {
        if (role === userRolesConfig.ADMIN) {
            setDynamicKeys(adminKeys)
            setItems(adminItems(collapsed))
        } else if (role === userRolesConfig.USER) {
            setDynamicKeys(userKeys)
            setItems(userItems(collapsed, permissionsGet))
        } else if (role === userRolesConfig.INVESTOR) {
            setDynamicKeys(investorKeys)
            setItems(investorItem(collapsed, permissionsGet))
        }
        else if (superUsers === true) {
            setDynamicKeys(adminKeys)
            setItems(adminItems(collapsed))
        }

    }, [collapsed])


    useEffect(() => {
        const pathname = route.pathname;
        const parts = pathname.split('/');
        const lastPart = parts[1];
        setActiveTab(lastPart)
        const storedOpenKeys = JSON.parse(localStorage.getItem('openKeys'));
        if (storedOpenKeys) {
            setOpenKeys(storedOpenKeys);
        }
    }, [route])

    const onOpenChange = (keys) => {
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        if (dynamicKeys.indexOf(latestOpenKey) === -1) {
            localStorage.setItem('openKeys', JSON.stringify(keys));
            setOpenKeys(keys);
        } else {
            localStorage.setItem('openKeys', JSON.stringify(latestOpenKey ? [latestOpenKey] : []));
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };

    const onClick = ({ key }) => {
        if (key === null) {
        }
        else {
            navigate(`${key}/`)
        }
    }

    return (
        <Fragment>
            <MenuHolder>
                <Menu
                    onClick={onClick}
                    openKeys={openKeys}
                    onOpenChange={onOpenChange}
                    selectedKeys={[activeTab]}
                    mode="inline"
                    theme="dark"
                    items={items}
                    style={{ border: 'none', background: 'transparent' }}
                />
            </MenuHolder>
        </Fragment>
    )
}

