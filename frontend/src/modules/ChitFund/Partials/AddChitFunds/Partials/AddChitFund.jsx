import { Button, CustomDatePicker, CustomInput, CustomInputNumber } from '@components/form'
import { CustomCardView, CustomModal, CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { Col, Form, Spin } from 'antd'
import React, { useEffect, useState } from 'react'
import { AddChitFundMembers } from './AddChitFundMembers'
import { StyledRemoveBtn } from '../style'
import { SvgIcons } from '@assets/Svg'
import request from '@request/request'
import { toast } from 'react-toastify'
import { AiFillPlusCircle } from 'react-icons/ai'
import { CustomStandardTable } from '@components/form/CustomStandardTable'
import { APIURLS } from '@request/apiUrls/urls'
import errorHandler from '@request/errorHandler'
import successHandler from '@request/successHandler'
import dayjs from 'dayjs'
import DummyUser1 from '@assets/images/avatar.jpg'



export const AddChitFund = ({ trigger, ChitFundRecord, chitTrigger, chitClose, FormUpdate }) => {

  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [fixedAmt, setFixedAmt] = useState({});
  const [isloading, setIsloading] = useState(false);
  // =============  Dynamic Table Data
  const [editMember, setEditMember] = useState({});
  const [cashInAmt, setCashInAmt] = useState({});
  const [shareMax, setShareMax] = useState();  // use Max Cashin hand amt to share amt enter

  const [initialImageValue, setInitialImageValue] = useState([]);
  const [initialImageValueDoct, setInitialImageValueDoct] = useState([]);
  const [memberDetalEdit, setMemberDetalEdit] = useState({});

  // For Showing on Table 
  const [dynamicTableData, setDynamicTableData] = useState([]);

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ======  Modal Title and Content ========
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  // ----------  Form Reset UseState ---------
  const [modelwith, setModelwith] = useState(0);
  const [personTrigger, setPersonTrigger] = useState(0);

  useEffect(() => {
    form.resetFields();
  }, [trigger])

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

  const onEditMember = (record, rowKey) => {
    setPersonTrigger(personTrigger + 1)
    setModelwith(700)
    setModalTitle("Update Person Details");
    setModalContent(<AddChitFundMembers EditRecord={record} handleOk={handleOk} fixedAmt={fixedAmt}
      memberDetalEdit={memberDetalEdit} MemberDynamicEdit={MemberDynamicEdit} setFixedAmt={setFixedAmt} personTrigger={personTrigger}
      index={rowKey} ChitFundRecord={ChitFundRecord} />);
    showModal();
  }

  useEffect(() => {
    if (ChitFundRecord) {
      GetMemberEditDetails()
    }
  }, [ChitFundRecord, chitTrigger])

  const GetMemberEditDetails = async (data) => {
    await request.get(`${APIURLS.GET_MEMBER_CHITFUND_VIEW}/${ChitFundRecord?.id}/`, data)
      .then(function (response) {
        setMemberDetalEdit(response.data)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      })
  }
  //--------------- Cash inChit Share Amt-----------------------
  useEffect(() => {
    GetCashInHandAmt();
  }, [])

  const GetCashInHandAmt = async (data) => {
    await request.get(`${APIURLS.CASH_IN_HAND_CHITSHAREAMT}`, data)
      .then(function (response) {
        setCashInAmt(response.data)
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      })
  }

  //-------------------------------------------------------------------
  useEffect(() => {
    if (ChitFundRecord) {
      const startingDate = new Date(memberDetalEdit?.starting_date);
      const dateFormat = 'YYYY/MM/DD';
      const MemberDOB = dayjs(startingDate).format(dateFormat);

      form.setFieldsValue(memberDetalEdit)
      form.setFieldsValue({
        starting_date: dayjs(MemberDOB, dateFormat),
        // images: initialImageValue,
        // documents: initialImageValueDoct,
      })
      setFixedAmt(memberDetalEdit?.fixed_chitfund_amount)
    }
  }, [ChitFundRecord, memberDetalEdit])

  const settingTableData = () => {
    const tableData = memberDetalEdit?.chitt_fund.map((value, index) => ({
      ...value,
      key: index
    }));

    setDynamicTableData(tableData);
  }

  useEffect(() => {
    if (ChitFundRecord) {
      if (memberDetalEdit?.chitt_fund) {
        settingTableData()
      }
    }
  }, [ChitFundRecord, memberDetalEdit]);

  const MemberTableColumn = [
    {
      title: "SI No",
      render: (value, item, index) => index + 1,
    },
    {
      title: 'Name',
      dataIndex: 'invester_name'
    },

    {
      title: 'Mobile',
      dataIndex: 'invester_mobile'
    },
    {
      title: 'Email',
      dataIndex: 'invester_email',
      render: (email) => {
        return email ? email : <div style={{ textAlign: "center" }}>--</div>;
      }
    },
    {
      title: 'Address',
      dataIndex: 'invester_address'
    },
    {
      title: 'Amount',
      dataIndex: 'investment_amt'
    },
    {
      title: 'Type',
      dataIndex: 'invester_type'
    },
    {
      title: 'Photo',
      dataIndex: 'images',
      render: (text, record, index) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '5px' }}>
            {record.images ?
              <img
                src={record?.images && record.images}
                style={{ height: '40px', width: '40px' }}
                onError={(e) => {
                  console.error("Error loading image:", e);
                }}
              /> :
              <img
                src={DummyUser1}
                style={{ height: '40px', width: '40px' }}
                onError={(e) => {
                  console.error("Error loading image:", e);
                }}
              />
            }
          </div>
        )
      }
    },
    // {
    //   title: 'Document',
    //   dataIndex: 'documents',
    //   render: (text, record, index) => {
    //     return (
    //       <div style={{ height: '40px', width: '40px' }}>
    //         <img
    //           src={record?.documents}
    //           style={{ height: '40px', width: '40px' }}
    //           onError={(e) => {
    //             console.error("Error loading image:", e);
    //           }}
    //         />
    //       </div>

    //     )
    //   }
    // },

    {
      title: 'Action',
      render: (text, record, index) => {
        const rowKey = record?.key
        return (
          <Flex gap={'true'} center={'true'}>
            <StyledRemoveBtn>
              <AiFillPlusCircle style={{ fontSize: '23px', marginRight: '10px', color: 'blue' }} onClick={() => onEditMember(record, rowKey)} />
            </StyledRemoveBtn>
            <img src={SvgIcons.Remove} onClick={() => RowRemove(rowKey)} />
          </Flex>
        )

      }
    }
  ]

  const handleOnChange = (date) => {
    setSelectedDate(date);
  };

  const onReset = () => {
    form.resetFields();
  }

  // ---------- SET VALUE TO DYNAMIC DATA ------

  const SetDynamicTable = (value) => {
    setDynamicTableData((prev) => {
      if (!Array.isArray(prev)) {
        return [{ ...value, key: 0 }];
      }
      const maxKey = Math.max(...prev.map(item => item.key), 0);
      return [...prev, { ...value, key: maxKey + 1 }];
    });
  }

  const MemberDynamicEdit = (value) => {
    setDynamicTableData((prev) => {

      if (!Array.isArray(prev)) {
        // If prev is not an array, create a new array with the current and new value
        return [{ ...value, key: 0 }];
      }

      const rowIndexToUpdate = dynamicTableData.findIndex(
        (item) => item.key === value?.key
      );

      if (rowIndexToUpdate !== -1) {
        // Create a copy of the previous array
        const updatedDynamicTable = [...prev];
        // Update the values for the row at the specified index
        updatedDynamicTable[rowIndexToUpdate] = { ...value };
        return updatedDynamicTable;
      }
      // Find the index of the row to update based on the key
      // If the row doesn't exist, simply add it to the end of the array
      const maxKey = Math.max(...prev.map((item) => item.key), 0);
      return [...prev, { ...value, key: maxKey + 1 }];
    })
  }

  const RowRemove = (rowKey) => {
    const newArr = dynamicTableData?.filter(item => item.key !== rowKey);
    setDynamicTableData(newArr);

  }

  // ------------Management Calculation 
  const handleManagementCalculation = (value) => {

    const FixedChitfundAmt = form.getFieldValue('fixed_chitfund_amount') || 0
    const MangementShareCount = form.getFieldValue('management_share_count')

    const ManagentAmt = FixedChitfundAmt * MangementShareCount || 0;
    form.setFieldsValue({ management_amt: ManagentAmt })


    setFixedAmt(FixedChitfundAmt);
    // Feb 2026 UX polish: refetch the cash-in-hand right when the
    // operator starts typing the Management Amount so a stale
    // `useState({})` initial or a value that changed in another tab
    // never sneaks through. The compare below then reads the just-
    // arrived value from state instead of the empty initial map.
    GetCashInHandAmt();

    const rawCash = cashInAmt?.cash_in_hand;
    const GetCashInHandAmtVal = (rawCash === null || rawCash === undefined || rawCash === '')
      ? null
      : Number(rawCash);

    if (GetCashInHandAmtVal === null) {
      // No treasure record yet OR the field is NULL. Guide the
      // operator to seed cash first — friendlier than the old
      // "which is null" message.
      toast.warn(
        'Cash-In-Hand is not yet set for this temple. Please add an ' +
        'Income entry (opening balance) before creating a chit fund.'
      );
    } else if (ManagentAmt > GetCashInHandAmtVal) {
      toast.warn(
        `Management Amount (Rs. ${ManagentAmt}) exceeds current ` +
        `Cash-In-Hand (Rs. ${GetCashInHandAmtVal}). Please reduce the ` +
        `Share Count or top up the treasury first.`
      );
    }

  }

  //--------------- Add/Update Functions---------------------------

  const AddChitFund = async (data) => {
    setIsloading(true)
    await request.post(APIURLS.ADD_CHIT_FUNT, data)
      .then(function (response) {

        if (response.status === 226) {
          toast.warn(response.data?.Message)
        }
        else {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: 'success',
            type: 'success',
          })
          form.resetFields();
          setDynamicTableData([]);
        }
        setIsloading(false);

        return response.data;
      })
      .catch(function (error) {
        setIsloading(false)
        if (error.response.status === 400) {
          if (error.response.data?.chitt_fund[0]?.invester_email) {
            toast.error(error.response.data?.chitt_fund[0]?.invester_email[0])
          }
        } else {
          errorHandler(error);
        }
      })
  }


  const UpdateChitFund = async (data) => {
    setIsloading(true)
    await request.put(`${APIURLS.EDIT_CHIT_FUNT}/${ChitFundRecord?.id}/`, data)
      .then(function (response) {
        if (response.status === 226) {
          toast.warn(response.data?.Message)
        }
        else {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: 'success',
            type: 'success',
          })
          form.resetFields();
          FormUpdate();
        }
        setIsloading(false)
        return response.data;
      })
      .catch(function (error) {
        setIsloading(false)
        if (error.response.status === 400) {
          if (error.response.data?.chitt_fund[0]?.invester_email) {
            toast.error(error.response.data?.chitt_fund[0]?.invester_email[0])
          }
        } else {
          errorHandler(error);
        }
      })
  }

  const onFinish = (data) => {

    if (ChitFundRecord) {
      const FamDetails = {
        ...data,
        starting_date:
          data?.starting_date === null
            ? ""
            : dayjs(selectedDate).format("YYYY-MM-DD")
              ? dayjs(data?.starting_date).format("YYYY-MM-DD")
              : dayjs(data?.starting_date).format("YYYY-MM-DD"),
        chitt_fund: dynamicTableData
      }
      const formData = new FormData();
      formData.append('chit_name', FamDetails?.chit_name);
      formData.append('starting_date', FamDetails?.starting_date);
      formData.append('management_amt', FamDetails?.management_amt);
      formData.append(`set_profit_percent`, FamDetails.set_profit_percent);
      formData.append(`set_intrest_percent`, FamDetails.set_intrest_percent);
      formData.append(`fixed_chitfund_amount`, FamDetails.fixed_chitfund_amount);
      formData.append(`management_share_count`, FamDetails.management_share_count);

      let memberDetailCount = FamDetails?.chitt_fund.length || 0;
      formData.append('field_count', memberDetailCount);

      FamDetails?.chitt_fund.forEach((element, index) => {
        formData.append(`chit[${index + 1}][invester_name]`, element?.invester_name || '')
        if (element?.invester_member === undefined) {
          console.log('sdf');
        } else {
          formData.append(`chit[${index + 1}][invester_member]`, element?.invester_member)
        }
        if (element?.id) {
          formData.append(`chit[${index + 1}][id]`, element?.id || '')
        }
        formData.append(`chit[${index + 1}][invester_mobile]`, element?.invester_mobile || '')
        formData.append(`chit[${index + 1}][invester_email]`, element?.invester_email || '')
        formData.append(`chit[${index + 1}][investment_amt]`, element?.investment_amt || 0)
        formData.append(`chit[${index + 1}][share_count]`, element?.share_count || 0)
        formData.append(`chit[${index + 1}][invester_address]`, element?.invester_address || '')
        formData.append(`chit[${index + 1}][invester_type]`, element?.invester_type || null)

        // Update Image

        if (element?.images?.length === 0) {
          formData.append(`chit[${index + 1}][photo_status]`, "false");
        } else if (element?.image_send_value && element?.image_send_value.length > 0) {
          formData.append(`chit[${index + 1}][images]`, element.image_send_value[0].originFileObj);
        }

        else {
          console.log('No Pic Selected');
        }

        // Update Document
        if (element?.documents?.length === 0) {
          formData.append(`chit[${index + 1}][doc_status]`, "false");
        } else if (element?.document_send_value && element?.document_send_value.length > 0) {
          formData.append(`chit[${index + 1}][documents]`, element.document_send_value[0].originFileObj);
        }

        else {
          console.log('No Doc Selected');
        }


      });
      UpdateChitFund(formData);
      // console.log([...formData.entries()], 'UpdateChitFormData');
    }
    else {
      const FamDetails = {
        ...data,
        starting_date:
          data?.starting_date === null
            ? ""
            : dayjs(selectedDate).format("YYYY-MM-DD")
              ? dayjs(data?.starting_date).format("YYYY-MM-DD")
              : dayjs(data?.starting_date).format("YYYY-MM-DD"),
        chitt_fund: dynamicTableData
      }

      const formData = new FormData();
      formData.append('chit_name', FamDetails?.chit_name);
      formData.append('starting_date', FamDetails?.starting_date);
      formData.append('management_amt', FamDetails?.management_amt);
      formData.append(`set_profit_percent`, FamDetails.set_profit_percent);
      formData.append(`set_intrest_percent`, FamDetails.set_intrest_percent);
      formData.append(`fixed_chitfund_amount`, FamDetails.fixed_chitfund_amount);
      formData.append(`management_share_count`, FamDetails.management_share_count);

      let memberDetailCount = FamDetails?.chitt_fund.length || 0;
      formData.append('field_count', memberDetailCount);

      FamDetails?.chitt_fund.forEach((element, index) => {
        formData.append(`chit[${index + 1}][invester_name]`, element?.invester_name || '')
        if (element?.invester_member === undefined) {
          console.log('sdf');
        } else {
          formData.append(`chit[${index + 1}][invester_member]`, element?.invester_member)
        }
        formData.append(`chit[${index + 1}][invester_mobile]`, element?.invester_mobile || '')
        formData.append(`chit[${index + 1}][invester_email]`, element?.invester_email || '')
        formData.append(`chit[${index + 1}][investment_amt]`, element?.investment_amt || 0)
        formData.append(`chit[${index + 1}][share_count]`, element?.share_count || 0)
        formData.append(`chit[${index + 1}][invester_address]`, element?.invester_address || '')
        formData.append(`chit[${index + 1}][invester_type]`, element?.invester_type || null)

        //Add image
        if (element?.images && element.images.length > 0) {
          formData.append(`chit[${index + 1}][images]`, element?.image_send_value[0]?.originFileObj);

        } else {
          console.error("No images selected");
        }

        //Add Document
        if (element?.documents && element.documents.length > 0) {
          formData.append(`chit[${index + 1}][documents]`, element?.document_send_value[0]?.originFileObj);

        } else {
          console.error("No Document selected");
        }

        // console.log([...formData.entries()], 'formDaa');
      })

      AddChitFund(formData)
      // console.log([...formData.entries()], 'addChitFormData');
    }

  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };


  return (

    <Form
      name='AddChitFund'
      form={form}
      labelCol={{
        span: 24,
      }}
      wrapperCol={{
        span: 24,
      }}
      initialValues={{
        starting_date: dayjs(),
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off">
      <CustomCardView>
        <CustomRow space={[12, 12]}>

          <Col span={24} md={24}>
            {ChitFundRecord ? <CustomPageTitle Heading={'Update Chit Fund'} /> : <CustomPageTitle Heading={'Add Chit Fund'} />}
          </Col>

          <Col span={24} md={12}>
            <CustomInput label={'Add Chit Funds'} name={'chit_name'}
              rules={[
                {
                  required: true,
                  message: 'Please Enter a Chit Name !',
                }
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomDatePicker label={'Start Date'} name={'starting_date'} onChange={handleOnChange} disabled
              rules={[
                {
                  required: true,
                  message: 'Please Choose a Start Date !',
                }
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber label={'Set Profit'} name={'set_profit_percent'} suffix={'%'}
              max={100}
              rules={[
                {
                  required: true,
                  message: 'Please Enter a Set Profit !',
                },
                {
                  validator: (_, value) => {
                    if (value !== undefined && value !== null && Number(value) > 100) {
                      return Promise.reject(new Error('Set Profit percentage cannot exceed 100%'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomInputNumber label={'Set Fund Interest'} name={'set_intrest_percent'} suffix={'%'}
              max={100}
              rules={[
                {
                  required: true,
                  message: 'Please Enter a Fund Interest !',
                },
                {
                  validator: (_, value) => {
                    if (value !== undefined && value !== null && Number(value) > 100) {
                      return Promise.reject(new Error('Set Fund Interest percentage cannot exceed 100%'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            />
          </Col>
          <Col span={12} md={7}>
            <CustomInputNumber label={'Chit Fund Share Amt'} name={'fixed_chitfund_amount'} disabled={ChitFundRecord && true}
              onChange={handleManagementCalculation} suffix={'₹'} rules={[
                {
                  required: true,
                  message: 'Please Enter a Chit Fund Share Amt !',
                }
              ]}
            />
          </Col>
          <Col span={12} md={7}>
            <CustomInputNumber label={'Management Share Count'} name={'management_share_count'}
              onChange={handleManagementCalculation} max={shareMax} rules={[
                {
                  required: true,
                  message: 'Please Enter a Management Share Count !',
                }
              ]}
            />
          </Col>
          <Col span={24} md={10}>
            <CustomInputNumber label={'Management Amount'} name={'management_amt'} disabled suffix={'₹'}
              rules={[
                {
                  required: true,
                  message: 'Please Enter a Management Amount !',
                }
              ]}
            />
            {/* Feb 2026 UX polish: surface the current Cash-In-Hand
                directly under the Management Amount input so operators
                immediately see the upper bound they can allocate. */}
            <div style={{ fontSize: '12px', marginTop: '4px', color: (cashInAmt?.cash_in_hand === null || cashInAmt?.cash_in_hand === undefined) ? '#c00' : '#555' }}>
              {(cashInAmt?.cash_in_hand === null || cashInAmt?.cash_in_hand === undefined)
                ? 'Cash-In-Hand not yet set — add an Income entry first.'
                : `Cash-In-Hand available: ₹ ${cashInAmt?.cash_in_hand}`}
            </div>
          </Col>

          <AddChitFundMembers SetDynamicTable={SetDynamicTable} MemberDynamicEdit={MemberDynamicEdit}
            editMember={editMember} setEditMember={setEditMember}
            initialImageValue={initialImageValue} setMemberDetalEdit={setMemberDetalEdit}
            fixedAmt={fixedAmt} chitTrigger={chitTrigger}
            ChitFundRecord={ChitFundRecord} memberDetalEdit={memberDetalEdit} />

          <Col span={24} md={24}>
            <CustomStandardTable columns={MemberTableColumn} data={dynamicTableData} />
          </Col>

        </CustomRow>
        {isloading ? <Flex center style={{ marginTop: '30px' }}><Spin /></Flex> :

          <Flex center gap={'20px'} style={{ margin: '30px' }}>
            {/* Feb 2026 UX polish: disable Add / Update while
                Cash-In-Hand is either not loaded yet or the entered
                Management Amount exceeds it, so the operator cannot
                submit a chit fund the treasury cannot fund. */}
            {(() => {
              const raw = cashInAmt?.cash_in_hand;
              const cashKnown = !(raw === null || raw === undefined || raw === '');
              const mgmtVal = Number(form.getFieldValue('management_amt') || 0);
              const overspend = cashKnown && mgmtVal > Number(raw);
              const disableSave = !cashKnown || overspend;
              return ChitFundRecord ?
                <>
                  <Button.Danger text={'Update'} htmlType={'submit'} disabled={disableSave} />
                  <Button.Success text={'Cancel'} onClick={chitClose} />
                </> :
                <>
                  <Button.Danger text={'Add'} htmlType={'submit'} disabled={disableSave} />
                  <Button.Success text={'Reset'} onClick={onReset} />
                </>;
            })()}
          </Flex>
        }
      </CustomCardView>
      <CustomModal isVisible={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} width={modelwith} modalTitle={modalTitle} modalContent={modalContent} />
    </Form>
  )
}
