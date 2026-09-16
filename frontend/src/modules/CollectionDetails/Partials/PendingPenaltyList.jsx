import { SvgIcons } from '@assets/Svg'
import { Button, CustomInput, CustomSelect, CustomTable } from '@components/form'
import { CustomCardView, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, message, Tag } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoPrint, IoRefresh } from 'react-icons/io5'
import request from '@request/request'

const CATEGORY_OPTIONS = [
    { label: 'All', value: 'All' },
    { label: 'Subscription Tariff', value: 'Subscription Tariff' },
    { label: 'Festival', value: 'Festival' },
    { label: 'Death', value: 'Death' },
    { label: 'Marriage', value: 'Marriage' },
]

const PendingPenaltyList = () => {
    const [loading, setLoading] = useState(false)
    const [rows, setRows] = useState([])
    const [summary, setSummary] = useState({ rate_per_month: 25, total_pending_penalty: 0 })
    const [filter, setFilter] = useState('All')
    const [search, setSearch] = useState('')

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data } = await request.get('penalty/pending/')
            setRows(Array.isArray(data?.results) ? data.results : [])
            setSummary({
                rate_per_month: data?.rate_per_month ?? 25,
                total_pending_penalty: data?.total_pending_penalty ?? 0,
            })
        } catch (err) {
            message.error(err?.response?.data?.message || 'Failed to load pending penalties')
            setRows([])
        } finally {
            setLoading(false)
        }
    }

    const recompute = async () => {
        setLoading(true)
        try {
            await request.post('penalty/recompute/')
            message.success('Penalties recomputed')
            await fetchData()
        } catch (err) {
            message.error(err?.response?.data?.message || 'Failed to recompute')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const filteredRows = useMemo(() => {
        const q = (search || '').toLowerCase().trim()
        return rows.filter((r) => {
            if (filter !== 'All' && r.category !== filter) return false
            if (!q) return true
            return (
                (r.member_name || '').toLowerCase().includes(q) ||
                String(r.member_no || '').toLowerCase().includes(q)
            )
        })
    }, [rows, filter, search])

    const TableColumn = [
        {
            title: 'SI No',
            render: (_v, _r, i) => i + 1,
            width: 70,
        },
        {
            title: 'Member ID',
            dataIndex: 'member_no',
            render: (v) => v ?? '-',
        },
        {
            title: 'Member Name',
            dataIndex: 'member_name',
            render: (v) => v || '-',
        },
        {
            title: 'Penalty Type',
            dataIndex: 'category',
            render: (v) => <Tag color="volcano" data-testid="penalty-category">{v || '-'}</Tag>,
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            render: (v) => v || '-',
        },
        {
            title: 'Missed Months',
            dataIndex: 'missed_months',
            render: (v) => <b data-testid="missed-months">{v ?? 0}</b>,
        },
        {
            title: 'Penalty Amount',
            dataIndex: 'penalty_amount',
            render: (v) => (
                <span data-testid="penalty-amount">₹ {Number(v || 0).toFixed(2)}</span>
            ),
        },
        {
            title: 'Pending',
            dataIndex: 'penalty_balance',
            render: (v) => (
                <span data-testid="penalty-balance">₹ {Number(v || 0).toFixed(2)}</span>
            ),
        },
        {
            title: 'Action',
            render: () => (
                <Flex gap={'20px'} center={'true'}>
                    <img src={SvgIcons.Person} />
                </Flex>
            ),
        },
    ]

    return (
        <div data-testid="pending-penalty-list">
            <CustomCardView>
                <CustomRow space={[12, 12]}>
                    <Col span={24} md={10}>
                        <CustomPageTitle Heading={'Pending Penalty List'} />
                        <div style={{ marginTop: 4, color: '#666' }}>
                            Rule: ₹{summary.rate_per_month} per missed month &middot; Total pending:{' '}
                            <b data-testid="total-pending">₹ {Number(summary.total_pending_penalty || 0).toFixed(2)}</b>
                        </div>
                    </Col>
                    <Col span={24} md={6}>
                        <CustomSelect
                            label={'Category'}
                            options={CATEGORY_OPTIONS}
                            name={'filter'}
                            value={filter}
                            onChange={(v) => setFilter(v)}
                        />
                    </Col>
                    <Col span={24} md={6}>
                        <CustomInput
                            label={'Search member'}
                            name={'value'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Col>
                    <Col span={24} md={2}>
                        <div style={{ paddingTop: 22 }}>
                            <Button.Primary
                                text={'Recompute'}
                                icon={<IoRefresh />}
                                onClick={recompute}
                                loading={loading}
                                data-testid="recompute-btn"
                            />
                        </div>
                    </Col>
                    <Col span={24}>
                        <CustomTable
                            columns={TableColumn}
                            data={filteredRows}
                            loading={loading}
                            rowKey={(r) => r.id}
                        />
                    </Col>
                </CustomRow>
                <Flex flexend={'right'} style={{ marginTop: '10px' }}>
                    <Button.Primary text={'Share'} icon={<FaWhatsapp />} />
                    <Button.Secondary text={'Print'} icon={<IoPrint />} />
                </Flex>
            </CustomCardView>
        </div>
    )
}

export default PendingPenaltyList
