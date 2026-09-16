import { CustomInput, CustomSelect } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageFormTitle } from '@components/others/CustomPageTitle'
import { Col, Form } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { StyledAdd } from '@modules/FamilyDetails/style'
import request from '@request/request'
import { APIURLS } from '@request/apiUrls/urls'
import { toast } from 'react-toastify'

const AddTenatPerson = ({ SetDynamicTable, SetDynamicEditTable, handleOk, normalfundlease, fundDetails, leaseAmt, personCounts, trigger, dummyData }) => {
    
    const [form] = Form.useForm();
    const [fundLease, setFundLease] = useState([]);

    useEffect(() => {
        GetFoundLeaseDetails();
    }, []);

    const GetFoundLeaseDetails = async (data) => {
        request
            .get(APIURLS.GET_FUND_LEASE)
            .then(function (response) {
                setFundLease(response.data);
                return response.data;
            })
            .catch(function (error) {
            });
    };
    // const Tenatoptions = fundLease.map((item) => item.fund_group.map((group) => ({
    //     label: group.member_name,
    //     value: group.id,
    // }))
    // )
    //     .flat();
    const Tenatoptions = fundDetails?.fund_group?.map((fun) => ({
        label: fun?.member_name,
        value: fun?.id
    }));

    const handleTenat = (value) => {
        const FindTenatperson = fundDetails?.fund_group?.find((tena) => tena?.id === value)
        form.setFieldsValue({ person_name: FindTenatperson?.member_name })
    }
    const onFinish = (values) => {
        if (dummyData?.length+1 > personCounts) {
            toast.warn("The number of persons must not exceed the distributed count!");
            return;
        }
        const Nevalues = {
            ...values,
            lease_amount: leaseAmt,
            key: values.key,
        };
        if (normalfundlease) {
            const newrec = { ...Nevalues, id: values?.id };
            SetDynamicEditTable(newrec);
            handleOk();

        } else {
            SetDynamicTable(Nevalues);
            form.resetFields();
        }

    };

    const onFinishFailed = () => {
        toast.warn("Please fill in all the required details !");
    };
    return (
        <Form
            name="addtenatperson"
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={{ date: dayjs(), start_date: dayjs() }}
            autoComplete="off"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
        >
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={24}>
                        <CustomPageFormTitle Heading={"Add Tenat Person"} />
                    </Col>
                    <Col span={24} md={12}>
                        <CustomSelect
                            options={Tenatoptions || []}
                            label={"Tenant Person"}
                            name={"fund_mem"}
                            onChange={handleTenat}
                            rules={[
                                {
                                    required: true,
                                    message: "Please Select a Tenat Person!",
                                },
                            ]}
                        />
                        <CustomInput name={"person_name"} display={"none"} />
                    </Col>
                    <Col span={24} md={24}>
                        <br />
                        <Flex center>
                            <StyledAdd htmlType="submit" style={{ cursor: 'pointer' }}>
                                <h3>Add</h3>
                            </StyledAdd>
                        </Flex>
                    </Col>
                </CustomRow>
            </CustomCardView>
        </Form>
    )
}

export default AddTenatPerson
