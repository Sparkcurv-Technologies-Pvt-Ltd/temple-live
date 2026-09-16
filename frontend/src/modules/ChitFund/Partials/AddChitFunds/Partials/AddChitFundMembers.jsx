import { Button, CustomInput, CustomInputNumber, CustomSelect, CustomTextArea, CustomUpload } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { Col, Form } from 'antd'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import request, { IMG_BASE_URL } from '@request/request'
import errorHandler from '@request/errorHandler'
import { APIURLS } from '@request/apiUrls/urls'
import { CustomPageFormTitle2 } from '@components/others/CustomPageTitle'


export const AddChitFundMembers = ({ SetDynamicTable, EditRecord, handleOk, MemberDynamicEdit, ChitFundRecord, chitTrigger,
    fixedAmt, memberDetalEdit, setFixedAmt, personTrigger }) => {
    const [form] = Form.useForm();

    const [memFindID, setMemFindID] = useState({})
    const [MemTrigger, setMemTrigger] = useState(0);

    const [isDisabled, setIsDisabled] = useState(false);
    const [imgInitial, setImgInitial] = useState([]);
    const [docInitial, setDocInitial] = useState([]);
    const [sendImgValue, setSendImg] = useState([]);
    const [docSendValue, setDocSendValue] = useState([]);
    const [imageUrl, setImageUrl] = useState([]);
    const [docUrl, setDocUrl] = useState([]);
    const [personType, setPersonType] = useState([])
    const [personTypeTrigger, setPersonTypeTrigger] = useState(0);
    const [MenberDetal, setMenberDetal] = useState([]);
    
    useEffect(() => {
        form.resetFields();
    }, [chitTrigger])


    const memberoption = MenberDetal?.map((mem) => ({ label: mem?.member_name, value: mem?.id }))

    const handleMemberId = (value) => {
        const MemberFindId = MenberDetal?.find((find) => find?.id === value)
        setMemFindID(MemberFindId)

        form.setFieldsValue({
            invester_member: MemberFindId?.id,
            invester_name: MemberFindId?.member_name,
            invester_mobile: MemberFindId?.member_mobile_number,
            invester_email: MemberFindId?.member_email,
            invester_address: MemberFindId?.address,
        })
        // setMemTrigger(MemTrigger + 1)
    }
    const personoption = [
        {
            label: 'Member',
            value: 'Member'
        },
        {
            label: 'Others',
            value: 'Other'
        },
    ]

    useEffect(() => {
        const FixedChitfundAmt = fixedAmt || 0
        const ShareCount = EditRecord ? EditRecord?.share_count && form.getFieldValue('share_count') : form.getFieldValue('share_count') || 0;
        const InvestedAmt = FixedChitfundAmt * ShareCount || 0
        form.setFieldsValue({ investment_amt: InvestedAmt })
        if (InvestedAmt < 0) {
            setIsDisabled(true)
            // toast.error("The Amount value was less than 0, so it can't be submitted.")
        } else {
            setIsDisabled(false)
        }

    }, [fixedAmt, EditRecord])
    useEffect(() => {
        if (EditRecord) {
            form.setFieldsValue(EditRecord);
            form.setFieldsValue({ images: imgInitial });
            form.setFieldsValue({ documents: docInitial });
            setPersonType(EditRecord?.invester_type);
            // GetMemberDetails();
        }
    }, [EditRecord, MenberDetal, personTrigger])

    useEffect(() => {
        const MemberFindId = MenberDetal?.find((find) => find?.id === EditRecord?.invester_member)
    }, [MenberDetal, EditRecord, personTrigger])

    useEffect(() => {
        if (EditRecord?.images?.length > 0) {
            setImgInitial([
                {
                    uid: "1",
                    name: "uploaded image",
                    status: "done",
                    url: `${EditRecord?.images}`,
                },
            ]);
        } else {
            setImgInitial([]);
        }
    }, [EditRecord, personTrigger]);
    useEffect(() => {
        if (EditRecord?.documents?.length > 0) {
            setDocInitial([
                {
                    uid: "1",
                    name: "uploaded Docment",
                    status: "done",
                    url: `${EditRecord?.documents}`,
                },
            ]);
        } else {
            setDocInitial([]);
        }
    }, [EditRecord, personTrigger]);

    // useEffect(() => {
    //     personType === 'Member' ?
    //         form.setFieldsValue({ invester_type: 'Member' }) :
    //         form.setFieldsValue({ invester_type: 'Other' })
    // }, [personType, personTypeTrigger])

    // useEffect(() => {
    //     if (personType) {
    //         form.resetFields()
    //         form.setFieldsValue({ fixed_chitfund_amount: fixedAmt })
    //         personType === 'Member' ?
    //             form.setFieldsValue({ invester_type: 'Member' }) :
    //             form.setFieldsValue({ invester_type: 'Other' })
    //     }
    // }, [personType])


    // // useEffect(() => {
    // //     form.setFieldsValue({ fixed_chitfund_amount: fixedAmt })
    // // }, [fixedAmt])




    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });

    const handleOnChange = async (img) => {
        // setImgTrigger(imgTrigger + 1);
        // console.log(img, "imgggg");
        setSendImg(img.fileList);

        if (img.fileList.length > 0) {
            const ImageObj = await Promise.all(
                img.fileList.map(async (value) => {
                    const base64Result = await getBase64(value.originFileObj);
                    const newObj = {
                        id: imageUrl.length + 1,
                        chit_img: base64Result,
                    };
                    return newObj;
                })
            );
            setImageUrl(ImageObj);
        }
    };
    const handleDocmentOnChange = async (img) => {
        // setImgTrigger(imgTrigger + 1);
        // console.log(img, "imgggg");
        setDocSendValue(img.fileList);

        if (img.fileList.length > 0) {
            const ImageObj = await Promise.all(
                img.fileList.map(async (value) => {
                    // Assuming getBase64 returns a Promise
                    const base64Result = await getBase64(value.originFileObj);

                    // Now, you can use base64Result
                    const newObj = {
                        id: imageUrl.length + 1,
                        chit_doc: base64Result,
                    };
                    return newObj;
                })
            );
            setDocUrl(ImageObj);
        }
    };

    const HandleShareCount = (value) => {
        const FixedChitfundAmt = fixedAmt || 0
        const ShareCount = value || 0;
        const InvestedAmt = FixedChitfundAmt * ShareCount || 0;
        form.setFieldsValue({ investment_amt: InvestedAmt })
        if (InvestedAmt < 0) {
            setIsDisabled(true)
            toast.error("The Amount value was less than 0, so it can't be submitted.")
        } else {
            setIsDisabled(false)
        }
    }

    const handlePersonType = (value) => {
        setPersonType(value)
        setPersonTypeTrigger(personTypeTrigger + 1)
    }
    useEffect(() => {
        GetMemberDetails()
    }, [])
    const GetMemberDetails = async (data) => {
        await request.get(APIURLS.GET_MEMBER_CHITFUND, data)
            .then(function (response) {
                setMenberDetal(response.data)
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            })
    }

    const onFinish = (values) => {
        const newValues = {
            ...values,
            //  images: imageUrl[0]?.chit_img,image_send_value: sendImgValue,

            images:
                values.images && values.images.length > 0
                    ? values.images[0]?.status === "done" ? values.images[0]?.url : values.images === "" ? "" : imageUrl[0]?.chit_img : "",
            image_send_value: sendImgValue,
            documents:
                values.documents && values.documents.length > 0
                    ? values.documents[0]?.status === "done" ? values.documents[0]?.url : values.documents === "" ? "" : docUrl[0]?.chit_doc : "",
            document_send_value: docSendValue,
            // documents: docUrl[0]?.chit_doc,document_send_value:docSendValue
        };
        if (EditRecord) {
            // let id = values?.id
            if(values?.id){
                newValues.id = values.id;
            }
            // setEditMember()
            MemberDynamicEdit(newValues)
            handleOk();

        } else {
            if (newValues?.invester_mobile && /^[6-9]\d{9}$/.test(newValues.invester_mobile)) {
                SetDynamicTable(newValues)
                form.setFieldsValue({
                    invester_name: null,
                    invester_member: null,
                    invester_mobile: null,
                    invester_email: null,
                    share_count: null,
                    investment_amt: null,
                    invester_address: null,
                    images: null,
                    documents: null,
                });
            }
            else {

                toast.info("Please Recheck the Mob Number, you have entered ")

            }
        }

    };

    const onFinishFailed = (errorInfo) => {
        toast.warn("Please fill in all the required details !");
    };


    return (

        <Form
            name='AddFamily'
            form={form}
            labelCol={{
                span: 24,
            }}
            wrapperCol={{
                span: 24,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off">
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={24}>
                        <CustomPageFormTitle2 Heading={'Person Details :'} />
                    </Col>
                {ChitFundRecord && <CustomInput name={"id"} display={'none'}/>}    
                    <Col span={24} md={12}>
                        <CustomSelect label={'Person Type'} name={'invester_type'} options={personoption}
                            onChange={handlePersonType} rules={[
                                {
                                    required: true,
                                    message: 'Please Select Member !',
                                }
                            ]} />
                    </Col>
                    {
                        personType === 'Member' ?
                            <Col span={24} md={12}>
                                <CustomSelect label={'Choose Member'} name={'invester_name'}
                                    options={memberoption} onChange={handleMemberId} disabled={ChitFundRecord && EditRecord ? true : false}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please Select Member !',
                                        }
                                    ]}
                                />
                                <CustomInput name={'invester_member'} display={'none'} />
                                <CustomInput name={'invester_type'} display={'none'} />
                            </Col> :
                            <Col span={24} md={12}>
                                <CustomInput label={'Person Name'} name={'invester_name'}
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please Enter Person Name !',
                                        }
                                    ]}
                                />
                                <CustomInput name={'invester_type'} display={'none'} />

                            </Col>}


                    <Col span={24} md={12}>
                        <CustomInputNumber label={'Mobile Number'} name={'invester_mobile'} maxLength={10}
                            minLength={10}
                            onKeyPress={(event) => {
                                if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                }
                            }}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Mobile Number !',
                                }
                            ]}
                        />
                        <CustomInput name={'key'} label={'key'} display={'none'} />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomInput label={'Email'} name={'invester_email'} type={'email'} />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInputNumber label={'Share Count'} name={'share_count'}
                            onChange={HandleShareCount} rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Count !',
                                }
                            ]}
                        />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInputNumber label={'Amount'} name={'investment_amt'} suffix={'₹'} disabled
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Amount !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomTextArea label={'Address'} name={'invester_address'}
                            rules={[
                                {
                                    required: true,
                                    message: 'Please Enter Address !',
                                }
                            ]}
                        />
                    </Col>

                    <Col span={24} md={12}>
                        <CustomUpload label={'Photo'} name={'images'} maxCount={1} form={form}
                            initialValue={imgInitial} accept=".png,.jpeg,.jpg"
                            onChange={handleOnChange}
                        // rules={[
                        //     {
                        //         required: true,
                        //         message: 'Please Upload Photo !',
                        //     }
                        // ]}
                        />
                        <CustomUpload label={'Document'} name={'documents'} maxCount={1}
                            form={form} initialValue={docInitial} accept=".pdf,.doc,.docx"
                            onChange={handleDocmentOnChange}                        // rules={[
                        //     {
                        //         required: true,
                        //         message: 'Please Upload Document !',
                        //     }
                        // ]}
                        />
                    </Col>

                </CustomRow>
                <Flex center gap={'20px'} style={{ margin: '30px' }}>
                    {/* {personType ?
                            <Button.Primary text={"Adddd"} onClick={() => form.submit()} />
                            : null} */}

                    {/* <StyledAdd onClick={() => form.submit()} >
                        <h3>{editMember?.key ? 'upadate' : 'Add'}</h3>
                    </StyledAdd> */}
                    <Button.Success text={EditRecord ? 'update' : 'Add'}
                        onClick={() => form.submit()} disabled={isDisabled === true ? true : false} />

                </Flex>
            </CustomCardView>
        </Form>
    )
}
