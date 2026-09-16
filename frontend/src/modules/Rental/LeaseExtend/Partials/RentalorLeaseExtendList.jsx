import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput, CustomSelect, CustomTable } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col } from 'antd'
import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint } from 'react-icons/io5'

const RentalorLeaseExtendList = () => {

    const filteroption = [
        {
            label: 'filter',
            value: 'filter'
        }
    ]

    const TableColumn = [
        {
            title: "SI No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Rent / Lease ID',
            dataIndex: 'date'
        },
        {
            title: 'Date',
            dataIndex: 'Category'
        },
        {
            title: 'Extend Date',
            dataIndex: 'type'
        },
        {
            title: 'Amount',
            dataIndex: 'Member'
        },
        {
            title: '',
            dataIndex: 'income_amoun'
        },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <Flex gap={'20px'} center={'true'}>
                        <img src={SvgIcons.Edit} />
                        <img src={SvgIcons.Delete} />
                    </Flex>
                )
            }
        }
    ]

    const dataSource = [
        {
            key: '1',
            date: "07/12/2023",
            income_type: "Donation",
            income_name: "Try",
            income_amount: "7777"
        }
    ]
    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Rental / Lease Extend List'} />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomSelect label={'Filter'} options={filteroption} name={'filter'} />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInput label={'Value'} name={'value'} disabled={'true'} />
                    </Col>
                    <Col span={24} md={24}>
                        <CustomTable columns={TableColumn} data={dataSource} />
                    </Col>
                </CustomRow>
                <Flex flexend={'right'} style={{ marginTop: "10px" }}>
                    <Button.Primary text={'Share'} icon={<FaWhatsapp />} />
                    <Button.Secondary text={'Print'} icon={<IoPrint />} />
                </Flex>
            </CustomCardView>
        </div>
    )
}

export default RentalorLeaseExtendList