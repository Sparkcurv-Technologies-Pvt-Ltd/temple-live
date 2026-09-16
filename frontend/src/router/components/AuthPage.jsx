import React, { Fragment, useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { adminAuthenticated, investerDashBoard, userAuthenticated } from '@router/config/routes'
import { CustomModal, Flex } from '@components/others'
import styled from 'styled-components'
import DashboardLayout from '@layout/DashboardLayout'
import { useDispatch, useSelector } from 'react-redux'
import { logOut, selectCurrentSuperUser, selectCurrentUserRole, userExpire } from '@modules/Auth/authSlice'
import { userRolesConfig } from '@router/config/roles'
import { Button } from '@components/form'

const PageFlex = styled(Flex)`
  overflow: hidden;
`
const AuthPage = ({ isAuthenticated }) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [authRoutePages, setAuthRoutePages] = useState([]);

    const role = useSelector(selectCurrentUserRole); //<<<<<<<<<<<<<<<< User Role <<<<<<<<<<<<//
    const superUsers = useSelector(selectCurrentSuperUser) //<<<<<<<<<<<<<<<< Super Users <<<<<<<<<<<<//
    const UserExpire = useSelector(userExpire)        //>>>>>>>>>>>>>>>>>>>>  User Expire >>>>>>>>>//

    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(true);
    };
    useEffect(() => {
        if (isAuthenticated) {
            if (role === userRolesConfig.ADMIN) {
                setAuthRoutePages(adminAuthenticated);
            } else if (role === userRolesConfig.USER) {
                setAuthRoutePages(userAuthenticated);
            } else if (role === userRolesConfig.INVESTOR) {
                setAuthRoutePages(investerDashBoard);
            }
            else if (superUsers === true) {
                setAuthRoutePages(adminAuthenticated);
            }
            else {
                setAuthRoutePages(adminAuthenticated);
            }
        }
        else {
            navigate('/signin')
        }

    }, [role, isAuthenticated]);

    useEffect(() => {
        if (UserExpire) {
            setModalContent(<LogOutModal />);
            showModal();
        }
    }, [dispatch, UserExpire]);

    const Signout = () => {
        dispatch(logOut());
    };
    const LogOutModal = () => (
        <Fragment>
            <h1 style={{ fontSize: "1.2rem", textAlign: 'center' }}>Your session has timed out. Please log in again to continue.</h1>
            <br />
            <Flex style={{ justifyContent: "center", gap: "20px" }}>
                <Button.Primary text={"Logout"} onClick={Signout} />
            </Flex>
        </Fragment>
    );
    return (
        <PageFlex>
            {isAuthenticated && (
                <DashboardLayout>
                    <Routes>
                        {authRoutePages.map(({ routePath, Component }) => {
                            return (
                                <Route
                                    key={routePath}
                                    path={routePath}
                                    element={<Component />}
                                ></Route>
                            )
                        })}
                    </Routes>
                </DashboardLayout>
            )}
            <CustomModal
                isVisible={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                width={500}
                modalTitle={modalTitle}
                modalContent={modalContent}
            />
        </PageFlex>
    )
}

export default AuthPage
