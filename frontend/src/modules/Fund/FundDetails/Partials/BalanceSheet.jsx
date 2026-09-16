import { SvgIcons } from '@assets/Svg'
import { Button, CustomDatePicker, CustomDateRangePicker, CustomInput, CustomSelect, CustomTable } from '@components/form'
import { CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import request from '@request/request'
import successHandler from '@request/successHandler'
import { Col, Form } from 'antd'
import dayjs from 'dayjs'
import React from 'react'
import { useState } from 'react'
import { IoPrint } from 'react-icons/io5'

import styled from 'styled-components';
import { FestivalMemberView } from './BalanceSheetView'

const Tablestyle = styled.div`
  table {
    border-collapse: collapse;
    width: 100%;
    border: 1px solid #6B6B6B;
    text-align: center;

 }
  th {
    border: 1px solid #6B6B6B;
    padding: 8px;
    color: #fff;
  }
  td {
    padding: 8px;
    cursor: pointer;
    position: relative;
  }
  /* td::after{
    content: '';
    position: absolute;
    bottom: 0;
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 1px;
    background-color: #a3a3a34e;
    padding-bottom:'10px'
  } */
  .headinggg {
    font-size: 16px;
    color: black;
    font-weight: 500;
    .title {
        font-size: 18px;
        color: #6B6B6B;
        font-weight: 600;
    }
  }
`;




const BalanceSheet = () => {

    const [form] = Form.useForm();

    const [rangeType, setRangeType] = useState({})
    const [dataSource, setDataSource] = useState([])
    const [dateRange, setDateRange] = useState(dayjs().format("YYYY-MM-DD"));
    const [dateChange, setDateChange] = useState(dayjs().format("YYYY-MM-DD"));

    const [isModalOpen, setIsModalOpen] = useState(false);

    // ======  Modal Title and Content ========
    const [modalTitle, setModalTitle] = useState("");
    const [modalContent, setModalContent] = useState(null);

    // ----------  Form Reset UseState ---------
    const [modelwith, setModelwith] = useState(0);

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

    const DateRangeType = [
        {
            label: 'Custom Date Range',
            value: 'custom_date_range'
        },
        {
            label: 'Custom Date',
            value: 'custom_date'
        },
    ]

    const hadleDateChoose = (value) => {
        setRangeType(value)
    }

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const handleDateChange = (dates) => {
        setDateChange(dates)
    }

    const FestivalModal = () => {
        setModelwith(600);
        setModalContent(<FestivalMemberView record={dataSource} />);
        setModalTitle('Festival Member Details');
        showModal();
    }

    const onFinish = (value) => {
        const record = { ...value, dateRange, dateChange }
        let NewValue = {
            range_type: record?.range_type,
            start_date: record?.dateRange?.start_date || record?.dateChange,
            end_date: record?.dateRange?.end_date,
        }
        AddBalancesheet(NewValue)
    }

    const AddBalancesheet = async (data) => {
        await request
            .post(APIURLS.BALANCESHEET_DATE_POST, data)
            .then(function (response) {
                successHandler(response, {
                    notifyOnSuccess: true,
                    notifyOnFailed: true,
                    msg: "success",
                    type: "success",
                });
                setRangeType([]);
                form.resetFields();
                setDataSource(response.data)
                return response.data;
            })
            .catch(function (error) {
                return errorHandler(error);
            });
    };


    const CreditDetails = dataSource?.Credit
    const DebitDetails = dataSource?.Debit

    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={8}>
                        <CustomPageTitle Heading={'Balance Sheet'} />
                    </Col>
                    <Col span={24} md={16}>
                        <Button.Secondary text={'Print'} icon={<IoPrint />} style={{ float: 'right' }} />
                    </Col>
                </CustomRow><br />
                <Form
                    name="Fundbalancesheet"
                    form={form}
                    labelCol={{
                        span: 24,
                    }}
                    wrapperCol={{
                        span: 24,
                    }}
                    onFinish={onFinish}
                    // onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <CustomRow space={[12, 12]}>
                        <Col span={24} md={8}>
                            <p style={{ color: '#000' }}>Select Date :</p>
                            <CustomSelect name={'range_type'} options={DateRangeType}
                                placeholder={'Choose Date'} onChange={hadleDateChoose}
                                rules={[{ required: true, message: 'Required' }]} />
                        </Col>
                        {rangeType === 'custom_date_range' ?
                            <Col span={24} md={10}>
                                <p style={{ color: '#000' }}>Date Range :</p>
                                <CustomDateRangePicker name={'startend'} onChange={handleDateRangeChange}
                                    rules={[{ required: true, message: 'Required' }]} />
                            </Col>
                            : rangeType === 'custom_date' ?
                                <Col span={24} md={8}>
                                    <p style={{ color: '#000' }}>Custom Date :</p>
                                    <CustomDatePicker name={'start_date'} onChange={handleDateChange}
                                        rules={[{ required: true, message: 'Required' }]} />
                                </Col> : null}
                        <Col span={24} md={4}>
                            {rangeType &&
                                <Flex center gap={"20px"} style={{ margin: "10px 0" }}>
                                    <Button.Danger text={"Submit"} htmlType={"submit"} />
                                </Flex>
                            }
                        </Col>
                    </CustomRow>

                </Form><br />


                <Tablestyle>

                    <table>
                        <tr style={{ background: 'blue', padding: '20px' }}>
                            <th>Credit</th>
                            <th>Debit</th>
                        </tr>
                        <tr>
                            {CreditDetails && CreditDetails.festival ?
                                <td className='headinggg' onClick={() => FestivalModal()} >
                                    <CustomRow>
                                        <Col span={12} md={10}>
                                            <span className='title'>Festival -</span>
                                        </Col>
                                        <Col span={12} md={12}>
                                            {CreditDetails.festival.map((item, index) => (
                                                <span key={index}>
                                                    {item.amount}, {item.member_count}
                                                    {CreditDetails.festival.length > 1 && index !== CreditDetails.festival.length - 1 && <br />}
                                                </span>
                                            ))}
                                        </Col>
                                    </CustomRow>
                                </td>
                                : <td>-</td>}

                            {DebitDetails && DebitDetails.expense ?
                                <td className='headinggg'>
                                    <CustomRow>
                                        <Col span={12} md={10}>
                                            <span className='title'>expense -</span>
                                        </Col>
                                        <Col span={12} md={12}>
                                            {DebitDetails.expense.map((item, index) => (
                                                <span key={index}>
                                                    {item.amount}, {item.member_count}
                                                    {DebitDetails.expense.length > 1 && index !== DebitDetails.expense.length - 1 && <br />}
                                                </span>
                                            ))}
                                        </Col>
                                    </CustomRow>
                                </td>
                                : <td>-</td>}
                        </tr>

                        <tr>
                            {CreditDetails && CreditDetails.festival ?
                                <td className='headinggg'>
                                    <CustomRow>
                                        <Col span={12} md={10}>
                                            <span className='title'>Tariff -</span>
                                        </Col>
                                        <Col span={12} md={12}>
                                            {CreditDetails.tariff.map((item, index) => (
                                                <span key={index}>
                                                    {item.amount}, {item.member_count}
                                                    {CreditDetails.tariff.length > 1 && index !== CreditDetails.tariff.length - 1 && <br />}
                                                </span>
                                            ))}
                                        </Col>
                                    </CustomRow>
                                </td>
                                : <td>-</td>}
                            <td></td>
                        </tr>

                        <tr>
                            {CreditDetails && CreditDetails.income ?
                                <td className='headinggg'>
                                    <CustomRow>
                                        <Col span={12} md={10}>
                                            <span className='title'>Income -</span>
                                        </Col>
                                        <Col span={12} md={12}>
                                            {CreditDetails.income.map((item, index) => (
                                                <span key={index}>
                                                    {item.amount}
                                                    {CreditDetails.income.length > 1 && index !== CreditDetails.income.length - 1 && <br />}
                                                </span>
                                            ))}
                                        </Col>
                                    </CustomRow>
                                </td>
                                : <td>-</td>}
                            <td></td>
                        </tr>

                        <tr>
                            {CreditDetails && CreditDetails.death ?
                                <td className='headinggg'>
                                    <CustomRow>
                                        <Col span={12} md={10}>
                                            <span className='title'>Death -</span>
                                        </Col>
                                        <Col span={12} md={12}>
                                            {CreditDetails.death.map((item, index) => (
                                                <span key={index}>
                                                    {item.amount}, {item.member_count}
                                                    {CreditDetails.death.length > 1 && index !== CreditDetails.death.length - 1 && <br />}
                                                </span>
                                            ))}
                                        </Col>
                                    </CustomRow>
                                </td>
                                : <td>-</td>}
                            <td></td>
                        </tr>

                        <tr>
                            {CreditDetails && CreditDetails.marriage ?
                                <td className='headinggg'>
                                    <CustomRow>
                                        <Col span={12} md={10}>
                                            <span className='title'>Marriage -</span>
                                        </Col>
                                        <Col span={12} md={12}>
                                            {CreditDetails.marriage.map((item, index) => (
                                                <span key={index}>
                                                    {item.amount}, {item.member_count}
                                                    {CreditDetails.marriage.length > 1 && index !== CreditDetails.marriage.length - 1 && <br />}
                                                </span>
                                            ))}
                                        </Col>
                                    </CustomRow>
                                </td>
                                : <td>-</td>}
                            <td></td>
                        </tr>

                        <tr>
                            {CreditDetails && CreditDetails.Rent_Lease ?
                                <td className='headinggg'>
                                    <CustomRow>
                                        <Col span={12} md={10}>
                                            <span className='title'>Rent & Lease -</span>
                                        </Col>
                                        <Col span={12} md={12}>
                                            {CreditDetails.Rent_Lease.map((item, index) => (
                                                <span key={index}>
                                                    {item.amount}, {item.member_count}
                                                    {CreditDetails.Rent_Lease.length > 1 && index !== CreditDetails.Rent_Lease.length - 1 && <br />}
                                                </span>
                                            ))}
                                        </Col>
                                    </CustomRow>
                                </td>
                                : <td>-</td>}
                            <td></td>
                        </tr>

                    </table>

                </Tablestyle>

                {/* <Col span={24} md={12}>
                        <h2>Credit Details</h2>
                        <CustomStandardTable columns={TableColumn} data={CreditBalance} />
                    </Col>
                    <Col span={24} md={12}>
                        <h2>Debit Details</h2>
                        <CustomStandardTable columns={TableColumndebit} data={DebitBalance} />
                    </Col> */}



            </CustomCardView>
            <CustomModal
                isVisible={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                width={modelwith}
                modalTitle={modalTitle}
                modalContent={modalContent}
            />
        </div >
    )
}

export default BalanceSheet