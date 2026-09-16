import React, { useLayoutEffect, useState } from 'react'
import { BodyContent, ContentLayout, HeaderNav, LogoutBottom, MainLayout, MenuBottom, SideMenuLayout, TopHeader } from '@layout/Partials/Style'
import { Drawer, Layout } from 'antd'
import { Button } from '@components/form'
import { SideMenu } from '@layout/Partials/SideMenu'
import { NavHeader } from '@layout/Partials/DynamicSubmenu/NavHeader'
import { CustomModal, Flex } from '@components/others'
import { HiOutlineLogout } from 'react-icons/hi'
import { useDispatch } from 'react-redux'
import { logOut } from '@modules/Auth/authSlice'
import { SvgIcons } from '@assets/Svg'

const DashboardLayout = ({ children }) => {

    const dispatch = useDispatch()
    const [collapsed, setCollapsed] = useState(false);
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState('left');

    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    // ===== Modal Functions Start =====

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const updateCollapse = () => {
        setCollapsed(!collapsed)
    }

    useLayoutEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const onChange = (e) => {
        setPlacement(e.target.value);
    };

    const AdminLogOut = () => {
        setModalContent(<LogOutModal />);
        setModalTitle("Log Out");
        showModal();
    }

    const LogOutModal = () => (
        <div>
            <h1 style={{ fontSize: '1.2rem' }}>Are you Sure You Want to Logout ?</h1>
            <br />
            <Flex gap={'20px'} W_100 center verticallyCenter>
                <Button.Primary text={'Logout'} onClick={Signout} />
                <Button.Secondary text={'Cancel'} onClick={handleOk} />
            </Flex>
        </div>
    )

    const Signout = () => {
        dispatch(logOut());
        localStorage.removeItem('openKeys')
    }
    return (
        <MainLayout>
            <Layout>
                <SideMenuLayout width={'280'} trigger={null} collapsible collapsed={collapsed}>
                    <HeaderNav onClick={() => setCollapsed(!collapsed)}>
                        <img
                            src={SvgIcons.Logoimg}
                            width={collapsed ? '40px' : '50px'}
                            style={{ marginLeft: collapsed ? '8px' : '4px', flexShrink: 0, transition: 'all 0.2s' }}
                            alt="Temple Logo"
                        />
                        <h3 className={collapsed ? 'active' : ''}>Temple</h3>
                    </HeaderNav>
                    <SideMenu collapsed={collapsed} />
                    <MenuBottom onClick={AdminLogOut}>
                        <HiOutlineLogout style={{ fontSize: '20px', color: '#C5A059' }} />
                        {collapsed ? '' : <h1>Log Out</h1>}
                    </MenuBottom>
                </SideMenuLayout>

                <Drawer
                    title={
                        <span style={{ color: '#C5A059', fontWeight: 800, fontSize: 18, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={SvgIcons.Logoimg} alt="logo" width={28} height={28} style={{ flexShrink: 0 }} />
                            Temple
                        </span>
                    }
                    placement={placement}
                    closable={true}
                    onClose={onClose}
                    open={open}
                    key={placement}
                    width={260}
                    styles={{ body: { padding: 0, background: '#2A0407' }, header: { background: '#1E0205', borderBottom: '1px solid rgba(197,160,89,0.15)' } }}>
                    <SideMenu collapsed={false} />
                    <LogoutBottom onClick={AdminLogOut}>
                        <HiOutlineLogout size={18} />
                        <span>Log Out</span>
                    </LogoutBottom>
                </Drawer>
                <ContentLayout $collapsed={collapsed}>
                    <TopHeader>
                        <NavHeader updateCollapse={updateCollapse} showDrawer={showDrawer} />
                    </TopHeader>
                    <BodyContent style={{ padding: '24px 24px' }}>
                        {children}
                    </BodyContent>
                </ContentLayout>
            </Layout>
            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel}
                width={520} modalTitle={modalTitle} modalContent={modalContent} />
        </MainLayout>
    )
}

export default DashboardLayout
