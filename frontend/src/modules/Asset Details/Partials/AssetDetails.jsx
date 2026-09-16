import React from 'react'
import { CustomUpload, Button, CustomAddSelect, CustomInput, CustomTextArea } from '@components/form'
import { CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Form, Spin } from 'antd'
import { AssetModals } from './AssetModals'
import { useState } from 'react';
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAsset, getAssetCategory, selectAssetCategoryDetails } from '../AssetSlice'
import request, { IMG_BASE_URL } from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import successHandler from '@request/successHandler'
import errorHandler from '@request/errorHandler'
import { toast } from 'react-toastify'

export const AssetDetails = ({ updateasset, closee, assettrigger }) => {

    const [form] = Form.useForm();
    const dispatch = useDispatch()
    const [selectedCategory, setSelectedCategory] = useState([])
    const [initialImageValue, setImageInitialValue] = useState([])
    const [initialDocumentValue, setDocumentInitialValue] = useState([])

    // ======  Modal Open ========
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modelwith, setModelwith] = useState(0);
    const [modalTitle, setModalTitle] = useState();
    const [modalContent, setModalContent] = useState(null);

    const [trigger, setTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(false)

    const showModal = () => {
        setIsModalOpen(true);
    };

    const close = () => {
        handleOk();
    }

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        dispatch(getAssetCategory())
    }, [])

    const AllAssetCategory = useSelector(selectAssetCategoryDetails)

    const AssetCategoryOptions = AllAssetCategory?.map((assetcat) => ({ label: assetcat?.categoryname, value: assetcat?.categoryname }))

    useEffect(() => {
        if (updateasset?.images?.length > 0) {
            setImageInitialValue(
                [{
                    uid: '1',
                    name: 'uploaded image',
                    status: 'done',
                    url: `${updateasset?.images}`,
                }],
            )
        }
        else {
            setImageInitialValue([]);
        }
    }, [updateasset, assettrigger])

    useEffect(() => {
        if (updateasset?.documents?.length > 0) {
            setDocumentInitialValue(
                [{
                    uid: '1',
                    name: 'uploaded document',
                    status: 'done',
                    url: `${updateasset?.documents}`,
                }],
            )
        }

        else {
            setDocumentInitialValue([]);
        }
    }, [updateasset, assettrigger])

    useEffect(() => {
        form.setFieldsValue(updateasset)

        form.setFieldsValue({ documents: initialDocumentValue, images: initialImageValue })

    }, [updateasset, assettrigger])

    const AddAssetDetails = async (data) => {
        setIsLoading(true)
        await request.post(`${APIURLS.POST_ASSET_DETAILS}`, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'Asset Details Added Successfully',
                    type: 'success',
                })
                form.resetFields()
                dispatch(getAsset())
                setIsLoading(false)
                return response.data;
            })
            .catch(function (error) {
                if(error.response.status === 406){
                    toast.error(error.response.data.message);
                    setIsLoading(false)
                  }
                  else{
                    setIsLoading(false)
                    return errorHandler(error);
                  }
            })
    }

    const UpdateAssetDetails = async (data) => {
        await request.put(`${APIURLS.PUT_ASSET_DETAILS}${updateasset?.id}/`, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: 'Asset Details Updated Successfully',
                    type: 'info',
                })
                closee()
                dispatch(getAsset())
                return response.data;
            })
            .catch(function (error) {
                if (error.response.status === 302) {
                    toast.error(error.response.data?.message);
                  } else {
                    errorHandler(error);
                  }
            })
    }

    const onFinish = (values) => {

        if (updateasset) {
            const formData = new FormData()

            formData.append('category', values?.category);
            formData.append('category_name', values?.category_name);
            formData.append('asset_name', values?.asset_name);
            formData.append('comments', values?.comments|| "");
            formData.append('details', values?.details || "");

            if (values?.images.length === 0) {
                formData.append('images_status', "false")
            } else if (!values?.images[0]?.url) {
                formData.append('images', values?.images[0].originFileObj)
            }

            if (values?.documents.length === 0) {
                formData.append('documents_status', "false")
            } else if (!values?.documents[0]?.url) {
                formData.append('documents', values?.documents[0].originFileObj)
            }

            UpdateAssetDetails(formData)
            // console.log([...formData.entries()], 'updattttAsset');
        }
        else {
            const formData = new FormData()

            formData.append('category', values?.category);
            formData.append('category_name', values?.category_name);
            formData.append('asset_name', values?.asset_name);
            formData.append('comments', values?.comments || "");
            formData.append('details', values?.details || "");

            if (values?.images && values.images.length > 0) {
                values.images.forEach((file) => {
                    formData.append(`images`, file.originFileObj);
                });
            } else {
                console.error('No images selected');
            }

            if (values?.documents && values.documents.length > 0) {
                values.documents.forEach((file) => {
                    formData.append(`documents`, file.originFileObj);
                });
            } else {
                console.error('No images selected');
            }
            AddAssetDetails(formData)
            // console.log([...formData.entries()], 'addddassettt');
        }

    }

    const onFinishFailed = () => {
        toast.warn("Please fill in all the required details !");
    }

    const handleAssetCategory = (catval) => {
        const SelectedAssetCategory = AllAssetCategory?.find((cat) => cat.categoryname === catval)
        form.setFieldsValue({ category: SelectedAssetCategory?.id })
    }

    const AddNewDesignation = () => {
        setTrigger(trigger + 1);
        setModelwith(500)
        setModalTitle("Add Asset");
        setModalContent(<AssetModals close={close} propertytrigger={trigger} />);
        showModal();
    }

    const onReset = () => {
        form.resetFields()
    }

    return (
        <Form
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}>
            <CustomCardView>
                {
                    updateasset ? (<CustomPageTitle Heading={'Update Asset'} />) : (<CustomPageTitle Heading={'Add Asset'} />)
                }
                <CustomRow space={[12, 12]} >

                    <Col span={24} md={12} >
                        <CustomAddSelect label={'Asset Category'} name={'category_name'} options={AssetCategoryOptions} onButtonClick={AddNewDesignation} onChange={handleAssetCategory}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Select a Category Name !'
                                }
                            ]} />

                        <CustomInput name={'category'} display={'none'} />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomInput label={'Asset Name'} name={'asset_name'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter a Asset Name !'
                                }
                            ]}
                        />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomUpload label={'Documents'} name={'documents'} form={form} listType='picture-card' maxCount={1} accept=".pdf,.doc,.docx" initialValue={initialDocumentValue} />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomUpload label={'Images'} name={'images'} form={form} listType='picture-card' maxCount={1} accept='.png,.jpeg,.jpg' initialValue={initialImageValue} />
                    </Col>

                    <Col span={24} md={12} >
                        <CustomTextArea label={'Details'} name={'details'} />
                    </Col>

                    <Col span={24} md={12} >
                        <CustomTextArea label={'Comments'} name={'comments'} />
                    </Col>

                </CustomRow>

                {/* <Flex center={'true'} gap={'20px'} style={{ marginTop: '20px' }}>
                    <Button.Danger text={updateasset ? 'Update' : 'Submit'} htmlType={'submit'} />
                    <Button.Success text={'Cancel'} onClick={closee} />
                </Flex> */}

                <Flex gap={'20px'} center={"true"} margin={'20px 0'}>
                    {isLoading ? <Spin /> : (
                        <>
                            {updateasset ? (
                                <>
                                    <Button.Success text={"Update"} htmlType={"submit"} />
                                    <Button.Danger text={"Cancel"} onClick={() => closee()} />
                                </>
                            ) : (
                                <>
                                    <Button.Danger text={"Submit"} htmlType={'submit'} />
                                    <Button.Success text={"Reset"} onClick={() => onReset()} />
                                </>)}

                        </>
                    )}

                </Flex>



            </CustomCardView>
            <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
        </Form>
    )
}
