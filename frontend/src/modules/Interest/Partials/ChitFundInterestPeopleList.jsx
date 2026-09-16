import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput, CustomSelect, CustomTable } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col } from 'antd'
import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint } from 'react-icons/io5'

const ChitFundInterestPeopleList = () => {

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
            title: 'Fund ID',
            dataIndex: 'family_idd'
        },
        {
            title: 'Fund Name',
            dataIndex: 'status'
        },
        {
            title: 'Member Name',
            dataIndex: 'genderr'
        },
        {
            title: 'Principle Amount',
            dataIndex: 'amount'
        },
        {
            title: 'Category',
            dataIndex: 'amountt'
        },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <Flex gap={'20px'} center={'true'}>
                    <img src={SvgIcons.Eye} />
                    <img src={SvgIcons.Edit} />
                    <img src={SvgIcons.HandMoney} />
                  </Flex>
                )
            }
        }
    ]

    const dataSource = [
        {
            key: '1',
            family_idd: "110",
            status: "Fund",
            genderr: "Murugan",
            amount : '777',
            amountt: "Category"
        }
    ]
    
    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Chit - Fund Interest People List'} width={'100%'}/>
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

export default ChitFundInterestPeopleList