import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput, CustomSelect, CustomTable } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col } from 'antd'
import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint } from 'react-icons/io5'

const ChitFundInterestWithCapital = () => {

    const filteroption = [
        {
            label: 'filter',
            value: 'filter'
        }
    ]

    const TableColumn = [
        {
            title: "S.No",
            render: (value, item, index) => index + 1,
        },
        {
            title: 'Date',
            dataIndex: 'date'
        },
        {
            title: 'Particulars',
            dataIndex: 'Category'
        },
        {
            title: 'Credit Amount',
            dataIndex: 'type'
        },
        {
            title: 'Debit Amount',
            dataIndex: 'Member'
        },
        {
            title: 'Balance Amount',
            dataIndex: 'income_amount'
        },
        // {
        //     title: 'Action',
        //     render: (text, record, index) => {
        //         return (
        //             <Flex gap={'20px'} center={'true'}>
        //                 <img src={SvgIcons.Eye} />
        //             </Flex>
        //         )
        //     }
        // }
    ]

    const dataSource = [
        {
            key: '1',
            date: "07/12/2023",
            Category: "Donation",
            type: "7000",
            Member: "Sithick",
            income_amount : "1000"
        }
    ]
    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Chit - Fund Interest with Capital'} width={'100%'}/>
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

export default ChitFundInterestWithCapital