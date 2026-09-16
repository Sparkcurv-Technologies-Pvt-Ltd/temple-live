import { SvgIcons } from '@assets/Svg'
import { TableIconHolder } from '@components/common/Styled'
import { CustomInput } from '@components/form'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import { CommonLoading, CustomCardView, CustomModal, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import CustomPopconfirm from '@components/others/CustomPopConfirm'
import { getMovableAssetCategory, getAssetCategoryStatus, selectAssetCategoryDetails, selectMovableAssetDetails, getMovableAssetStatus } from '@modules/Asset Details/AssetSlice'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import request from '@request/request'
import successHandler from '@request/successHandler'
import { Tooltip } from 'antd'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MovableAssestModal } from './MovableAssestModal'

export const MovableCategoryList = () => {

    const dispatch = useDispatch();

    const [trigger, setTrigger] = useState(0);

    const [searchTexts, setSearchTexts] = useState([]); //---------Seach Bar 1--------

    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modelwith, setModelwith] = useState(0);
    const [modalTitle, setModalTitle] = useState();
    const [modalContent, setModalContent] = useState(null);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const FormUpdate = () => {
        handleOk();
        dispatch(getMovableAssetCategory())
    }

    useEffect(() => {
        dispatch(getMovableAssetCategory())
    }, [])

    const AllDatas = useSelector(selectMovableAssetDetails)
    const AllStatus = useSelector(getMovableAssetStatus)

    const UpdateAssetsCategory = (record) => {
        setModelwith(600);
        setModalTitle('Update Movable Asset Category')
        setTrigger(trigger + 1);
        setModalContent(
            <MovableAssestModal updateRecord={record} FormUpdate={FormUpdate} UpdateTrigger={trigger} />
        );
        showModal();
    };

    const DeleteAsset = async (record) => {
        await request.delete(`${APIURLS.EDIT_MOVABLE_ASSET_CATEGORY}/${record?.id}/`, record)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                dispatch(getMovableAssetCategory())
            })
            .catch(function (error) {
                return errorHandler(error);
            });
    };

    const handleSearchs = (value) => {
        setSearchTexts(value);
    };

    const ColumnsData = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: "Category Name",
            render: (text, record) => record?.categoryname,
            filteredValue: searchTexts ? [searchTexts] : null,
            onFilter: (value, record) => {
                return (
                    String(record?.categoryname)
                        .toLowerCase()
                        .includes(value.toLowerCase()) ||
                    String(record?.categoryname).includes(value.toUpperCase())
                );
            },
        },
        {
            title: "Action",
            render: (text, record, index) => {
                return (
                    <Flex gap={"20px"} center={"true"}>

                        <Tooltip title="Edit">
                            <TableIconHolder size={"28px"}
                                onClick={() => UpdateAssetsCategory(record)} >
                                <img src={SvgIcons.Edit} style={{ cursor: "pointer" }} />
                            </TableIconHolder>
                        </Tooltip>

                        <CustomPopconfirm
                            title="Confirmation"
                            description="Are you sure you want to remove this movable asset category ?"
                            okText="Yes"
                            cancelText="No"
                            confirm={() => DeleteAsset(record)} >
                            <Tooltip title="Delete">
                                <img src={SvgIcons.Delete} style={{ cursor: "pointer" }} />
                            </Tooltip>
                        </CustomPopconfirm>

                    </Flex>
                );
            },
        },
    ]


    let content;

    if (AllStatus === "loading") {
        content = <CommonLoading />;
    } else if (AllStatus === "succeeded") {
        const rowKey = (AllDatas) => AllDatas.id;
        content = (
            <CustomStandardTable
                columns={ColumnsData} data={AllDatas || []} rowKey={rowKey} />
        );
    } else if (AllStatus === "failed") {
        const rowKey = (AllDatas) => AllDatas.id;
        content = <CustomStandardTable
            columns={ColumnsData} data={[]} rowKey={rowKey} />;
    }

    return (
        <CustomCardView>
            <Flex aligncenter spacebetween maxWidthEnter={'500'}>
                <div>
                    <CustomPageTitle Heading={'Movable Asset Category List'} />
                </div>
                <Flex aligncenter>
                    <p>Filter By Category Name :&nbsp;</p>
                    <CustomInput
                        value={searchTexts} placeholder="Category Name"
                        onChange={(e) => handleSearchs(e.target.value)} />
                </Flex>
            </Flex>
            {content}
            <CustomModal isVisible={isModalOpen}
                handleOk={handleOk} handleCancel={handleCancel}
                width={modelwith} modalTitle={modalTitle} modalContent={modalContent}
            />
        </CustomCardView>
    )
}
