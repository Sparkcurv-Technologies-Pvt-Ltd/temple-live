import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput, CustomSelect, CustomTable } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col } from 'antd'
import React from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint } from 'react-icons/io5'

const TaxList = () => {

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
            title: 'Date',
            dataIndex: 'date'
        },
        {
            title: 'Tax ID',
            dataIndex: 'taxid'
        },
        {
            title: 'Tax Amount',
            dataIndex: 'genderr'
        },
        {
            title: 'Status',
            dataIndex: 'status'
        },
        {
            title: 'From',
            dataIndex: 'from'
        },
        {
            title: 'To',
            dataIndex: 'to'
        },
        {
            title: 'Action',
            render: (text, record, index) => {
                return (
                    <Flex gap={'20px'} center={'true'}>
                    <img src={SvgIcons.Eye} />
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
            taxid: "110",
            genderr: "7800",
            status : 'Active',
            from : "17/12/2023",
            to: "19/12/2023",
        }
    ]
    return (
        <div>
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={12}>
                        <CustomPageTitle Heading={'Tax List'} />
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

export default TaxList