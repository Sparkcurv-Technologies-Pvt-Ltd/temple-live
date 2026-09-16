import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  CustomInput,
  CustomUpload,
  CustomInputNumber,
  CustomDatePicker,
  CustomSelect,
  CustomTextArea,
  Button,
} from "@components/form";
import { CustomCardView, CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Form, Spin } from "antd";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import {
  getBrideDetails,
  getGroomDetails,
  getmarriageDetails,
  selectBrideDetails,
  selectGroomDetails,
} from "../MarriageSlice";
import dayjs, { Dayjs } from "dayjs";
import { APIURLS } from "@request/apiUrls/urls";
import errorHandler from "@request/errorHandler";
import successHandler from "@request/successHandler";
import request from "@request/request";
import { toast } from "react-toastify";

const StyledMarriageHeading = styled.div`
  color: red;
`;

const Marriage = ({ closee, updatelist, marriagetrigger }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [groomNativeType, setGroomNativeType] = useState([]);
  const [brideNativeType, setBrideNativeType] = useState([]);
  const [groomFamily, setGroomFamily] = useState([]);
  const [brideFamily, setBrideFamily] = useState([]);

  const [invitationIntialValue, setInvitationIntialValue] = useState([]);
  const [marriagephotoIntialValue, setMarriagephotoIntialValue] = useState([]);
  const [marriagecertificateIntialValue, setMarriagecertificateIntialValue] = useState([]);
  const [isloading, setIsloading] = useState(false);


  // const [selecteDefaultDate, setSelecteDefaultDate] = useState(dayjs().format('YYYY-MM-DD'))
  // const [marriagedate, setmarriagedate] = useState(dayjs().format('YYYY-MM-DD'))
  // const [groomdob, setgroomdob] = useState(dayjs().format('YYYY-MM-DD'))
  // const [bridedob, setbridedob] = useState(dayjs().format('YYYY-MM-DD'))


  const [selecteDefaultDate, setSelecteDefaultDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [marriagedate, setmarriagedate] = useState(dayjs().format("YYYY-MM-DD"));
  const [groomdob, setgroomdob] = useState(dayjs().format("YYYY-MM-DD"));

  const [bridedob, setbridedob] = useState(dayjs().format("YYYY-MM-DD"));

  const [mentypeValue, setMentypeValue] = useState("Member");
  const [womentypeValue, setWomentypeValue] = useState("Member");

  const [dobDiisbled, setDobDisbled] = useState(false)
  const [dateDisbled, setDateDisbled] = useState(false)

  const [memberSetDob, setMemberSetDob] = useState()
  const [memberwomendob, setMemberwomendob] = useState()

  const type = [
    {
      label: "Member",
      value: "Member",
    },
    {
      label: "Other",
      value: "Other",
    },
  ];

  useEffect(() => {
    dispatch(getGroomDetails());
  }, []);

  useEffect(() => {
    dispatch(getBrideDetails());
  }, []);

  useEffect(() => {
    dispatch(getmarriageDetails());
  }, []);

  //update
  //invitation
  useEffect(() => {
    if (updatelist?.invitation?.length > 0) {
      setInvitationIntialValue([
        {
          uid: "1",
          name: "uploaded invitation",
          status: "done",
          url: `${updatelist?.invitation}`,
        },
      ]);
    } else {
      setInvitationIntialValue([]);
    }
  }, [updatelist, marriagetrigger]);

  //marriage certificate

  useEffect(() => {
    if (updatelist?.marriage_certificate?.length > 0) {
      setMarriagecertificateIntialValue([
        {
          uid: "1",
          name: "uploaded marriage certificate",
          status: "done",
          url: `${updatelist?.marriage_certificate}`,
        },
      ]);
    } else {
      setMarriagecertificateIntialValue([]);
    }
  }, [updatelist, marriagetrigger]);

  //marriage_photo
  useEffect(() => {
    if (updatelist?.marriage_photo?.length > 0) {
      setMarriagephotoIntialValue([
        {
          uid: "1",
          name: "uploaded marriage photo",
          status: "done",
          url: `${updatelist?.marriage_photo}`,
        },
      ]);
    } else {
      setMarriagephotoIntialValue([]);
    }
  }, [updatelist, marriagetrigger]);

  useEffect(() => {
    if (updatelist) {
      setupdatelist();
    }
  }, [updatelist, marriagetrigger]);

  const setupdatelist = () => {
    const todaydate = new Date(updatelist?.date);
    const dateFormat = "YYYY-MM-DD";
    const currentDate = dayjs(todaydate).format(dateFormat);

    const groomdob = new Date(updatelist?.groom_dob);
    const menDate = dayjs(groomdob).format(dateFormat);

    const bridedob = new Date(updatelist?.bride_dob);
    const womenDate = dayjs(bridedob).format(dateFormat);

    const marriagedate = new Date(updatelist?.marriage_date);
    const mgDate = dayjs(marriagedate).format(dateFormat);

    form.setFieldsValue(updatelist);

    setGroomNativeType(updatelist?.groom_native_type);
    setBrideNativeType(updatelist?.bride_native_type);

    setgroomdob(menDate)
    setbridedob(womenDate)
    setmarriagedate(mgDate)

    form.setFieldsValue({
      date: dayjs(currentDate, dateFormat),
      groom_dob: dayjs(menDate, dateFormat),
      bride_dob: dayjs(womenDate, dateFormat),
      marriage_date: dayjs(mgDate, dateFormat),
    });


    form.setFieldsValue({ invitation: invitationIntialValue });
    form.setFieldsValue({
      marriage_certificate: marriagecertificateIntialValue,
    });
    form.setFieldsValue({ marriage_photo: marriagephotoIntialValue });
  };

  const AllGroomDetails = useSelector(selectGroomDetails);
  const AllBrideDetails = useSelector(selectBrideDetails);

  const menDetail = AllGroomDetails?.map((item) => ({
    label: item?.family?.family_no,
    value: item?.family?.family_no,
  }));

  const womenDetail = AllBrideDetails?.map((items) => ({
    labe: items?.family?.family_no,
    value: items?.family?.family_no,
  }));

  const handleGroomNativeType = (e) => {
    setGroomNativeType(e);
    setGroomFamily([])
    form.setFieldsValue({ groom_member: null });
    form.setFieldsValue({ groom_name: null });
    form.setFieldsValue({ groom_address: null });
    form.setFieldsValue({ groom_family: null });
    form.setFieldsValue({ groom_mobile_number: null });
    form.setFieldsValue({ groom_family_no: null });
    // form.setFieldsValue({ groom_native_type: null});
    if (e === 'Member') {
      setDobDisbled(true)
    }
    else {
      setDobDisbled(false)
      form.setFieldsValue({ groom_dob: null })
    }
  };

  useEffect(() => {
    if (updatelist?.groom_native_type === "Member") {
      setDobDisbled(true)
    }
    else {
      setDobDisbled(false)
    }
  }, [updatelist])


  const handleBrideNativeType = (e) => {
    setBrideNativeType(e);
    form.setFieldsValue({ bride_member: null });
    form.setFieldsValue({ bride_name: null });
    form.setFieldsValue({ bride_family: null });
    form.setFieldsValue({ bride_address: null });
    form.setFieldsValue({ bride_mobile_number: null });
    // form.setFieldsValue({ bride_native_type: null});
    if (e === 'Member') {
      setDateDisbled(true)
    }
    else {
      setDateDisbled(false)
      form.setFieldsValue({ bride_dob: null })
    }
  };

  useEffect(() => {
    if (updatelist?.bride_native_type === "Member") {
      setDateDisbled(true)
    } else {
      setDateDisbled(false)
    }
  }, [updatelist])

  useEffect(() => {
    if (updatelist) {
      const getFamMen = AllGroomDetails?.find(
        (item) => item?.family?.family_no === updatelist?.groom_family_no
      );
      setGroomFamily(getFamMen);
    }
  }, [updatelist, AllGroomDetails])


  const handleGroomFamilyID = (value) => {
    form.setFieldsValue({ groom_member: null });
    form.setFieldsValue({ groom_name: null });
    form.setFieldsValue({ groom_dob: null });
    form.setFieldsValue({ groom_mobile_number: null });
    form.setFieldsValue({ groom_address: null });

    const getFamMen = AllGroomDetails?.find(
      (item) => item?.family?.family_no === value
    );

    setGroomFamily(getFamMen);
    form.setFieldsValue({
      groom_family: getFamMen?.family?.id,
      groom_address: getFamMen?.family?.address,
    });
  };

  // -----------------------------

  useEffect(() => {
    if (updatelist) {
      const BrideName = AllBrideDetails?.find(
        (item) => item?.family?.family_no === updatelist?.bride_family_no
      );

      setBrideFamily(BrideName);
    }

  }, [AllBrideDetails, updatelist])

  // -----------------------------

  const handleBrideFamilyID = (value) => {
    form.setFieldsValue({ bride_member: null });
    form.setFieldsValue({ bride_name: null });
    form.setFieldsValue({ bride_dob: null });
    form.setFieldsValue({ bride_mobile_number: null });
    form.setFieldsValue({ bride_address: null });

    const getFamwomen = AllBrideDetails?.find(
      (item) => item?.family?.family_no === value
    );
    setBrideFamily(getFamwomen);
    form.setFieldsValue({
      bride_family: getFamwomen?.family?.id,
      bride_address: getFamwomen?.family?.address,
    });
  };

  // useEffect(() => {
  //   if (updatelist?.bride_native_type === "Member") {
  //     setMemberSetDob(false)
  //   } else {
  //     setMemberSetDob(true)
  //   }
  //     }, [updatelist])

  const handleMen = (value) => {
    const getMenDetail = groomFamily?.mem?.find(
      (item) => item?.member_name === value
    );
    setMemberSetDob(getMenDetail?.member_dob);
    const menDob = new Date(getMenDetail?.member_dob);
    const dateFormat = "YYYY/MM/DD";
    const groomDob = dayjs(menDob).format(dateFormat);
    form.setFieldsValue({
      groom_dob: dayjs(groomDob, dateFormat),
    });

    form.setFieldsValue({
      // groom_dob: getMenDetail?.member_dob,
      groom_mobile_number: getMenDetail?.member_mobile_number,
      groom_member: getMenDetail?.id,
    });
  };

  const getMenOptions = groomFamily?.mem?.map((item) => ({
    label: `${item?.member_name} / ${item?.member_mobile_number}`,
    value: item?.member_name,
  }));

  const getWomenOptions = brideFamily?.mem?.map((item) => ({
    label: `${item?.member_name} / ${item?.member_mobile_number}`,
    value: item?.member_name,
  }));

  useEffect(() => {
    if (updatelist?.bride_native_type === "Member") {
      setMemberwomendob(updatelist?.bride_dob)
    } if (updatelist?.groom_native_type === "Member") {
      setMemberSetDob(updatelist?.groom_dob)

    }
  }, [updatelist])

  const handlewoMen = (value) => {
    const getWomenDetail = brideFamily?.mem?.find(
      (item) => item?.member_name === value
    );
    setMemberwomendob(getWomenDetail?.member_dob)
    const deathofdate = new Date(getWomenDetail?.member_dob);
    const dateFormat = "YYYY/MM/DD";
    const deathDate = dayjs(deathofdate).format(dateFormat);
    form.setFieldsValue({
      bride_dob: dayjs(deathDate, dateFormat),
    });

    form.setFieldsValue({
      // groom_dob: getWomenDetail?.member_dob,
      bride_mobile_number: getWomenDetail?.member_mobile_number,
      bride_member: getWomenDetail?.id,
    });
  };

  const currentDate = (detime) => {
    setSelecteDefaultDate(detime);
  };

  const handleGroomDOB = (gdob) => {
    setgroomdob(gdob);
  };

  const handleBrideDOB = (bdob) => {
    setbridedob(bdob);
  };

  const handlemarriagedate = (edate) => {
    setmarriagedate(edate);
  };
  const onFinish = (value) => {
    const NewDate = {
      ...value,

      groom_dob: groomdob,
      bride_dob: bridedob,

    };

    const formData = new FormData();
    if (updatelist) {
      formData.append("date", selecteDefaultDate);
      formData.append("groom_native_type", groomNativeType);
      if (value?.groom_native_type !== "Other") {
        formData.append("groom_family", value?.groom_family);
        formData.append("groom_member", value?.groom_member);
        formData.append("groom_family_no", value?.groom_family_no);
      }
      formData.append("groom_name", value?.groom_name);
      formData.append("groom_dob", groomNativeType === "Other" ? NewDate?.groom_dob : memberSetDob);


      formData.append("groom_mobile_number", value?.groom_mobile_number);
      formData.append("groom_marriage_amt", value?.groom_marriage_amt || 0);
      formData.append("groom_address", value?.groom_address || '');
      formData.append("bride_native_type", brideNativeType);
      if (value?.bride_native_type !== "Other") {
        formData.append("bride_family", value?.bride_family);
        formData.append("bride_family_no", value?.bride_family_no);
        formData.append("bride_member", value?.bride_member);
      }
      formData.append("bride_name", value?.bride_name);
      formData.append("bride_dob", brideNativeType === "Other" ? NewDate?.bride_dob : memberwomendob);
      formData.append("bride_mobile_number", value?.bride_mobile_number);
      formData.append("bride_marriage_amt", value?.bride_marriage_amt || 0);
      formData.append("bride_address", value?.bride_address || '');
      formData.append("marriage_date", marriagedate);
      formData.append("marriage_place", value?.marriage_place || '');
      formData.append("comments", value?.comments || '');

      // 

      if (value?.marriage_photo.length === 0) {
        formData.append("photo_status", "false");
      } else if (!value?.marriage_photo[0]?.url) {
        formData.append("marriage_photo", value?.marriage_photo[0].originFileObj);
      }

      if (value?.marriage_certificate.length === 0) {
        formData.append("certificate_status", "false");
      } else if (!value?.marriage_certificate[0]?.url) {
        formData.append("marriage_certificate", value?.marriage_certificate[0].originFileObj);
      }

      if (value?.invitation.length === 0) {
        formData.append("invitation_status", "false");
      } else if (!value?.invitation[0]?.url) {
        formData.append("invitation", value?.invitation[0].originFileObj);
      }

      // console.log([...formData.entries()], "update");
      if (groomNativeType === "Other" && brideNativeType === "Other") {
        toast.warn("If anyone of the marriage persons native type must be a member");
      } else {

        updateMarriageList(formData);
      }
    } else {
      formData.append("date", selecteDefaultDate);
      formData.append("groom_native_type", groomNativeType);
      if (value?.groom_native_type !== "Other") {
        formData.append("groom_family", value?.groom_family);
        formData.append("groom_member", value?.groom_member);
        formData.append("groom_family_no", value?.groom_family_no);
      }
      formData.append("groom_name", value?.groom_name);
      formData.append("groom_dob", groomNativeType === "Other" ? groomdob : memberSetDob);
      formData.append("groom_mobile_number", value?.groom_mobile_number);
      formData.append("groom_marriage_amt", value?.groom_marriage_amt || 0);
      formData.append("groom_address", value?.groom_address || '');
      formData.append("bride_native_type", brideNativeType);
      if (value?.bride_native_type !== "Other") {
        formData.append("bride_family", value?.bride_family);
        formData.append("bride_family_no", value?.bride_family_no);
        formData.append("bride_member", value?.bride_member);
      }
      formData.append("bride_name", value?.bride_name);
      // formData.append("bride_dob", brideNativeType === "Other" ? bridedob : memberwomendob);
      formData.append("bride_dob", brideNativeType === "Other" ? bridedob : memberwomendob);
      formData.append("bride_mobile_number", value?.bride_mobile_number);
      formData.append("bride_marriage_amt", value?.bride_marriage_amt || 0);
      formData.append("bride_address", value?.bride_address || '');
      formData.append("marriage_date", marriagedate);
      formData.append("marriage_place", value?.marriage_place || '');
      formData.append("comments", value?.comments || '');

      // const brideFamilyId = parseInt(value?.bride_family, 10);
      // formData.append('bride_family', brideFamilyId);

      if (value?.marriage_photo && value?.marriage_photo[0]?.originFileObj) {
        value.marriage_photo.forEach((file) => {
          formData.append(`marriage_photo`, file.originFileObj);
        });
      } else {
        console.error("No images selected");
      }

      if (value?.marriage_certificate && value?.marriage_certificate[0]?.originFileObj) {
        value.marriage_certificate.forEach((file) => {
          formData.append(`marriage_certificate`, file.originFileObj);
        });
      } else {
        console.error("No images selected");
      }

      if (value?.invitation && value?.invitation[0]?.originFileObj) {
        value.invitation.forEach((file) => {
          formData.append(`invitation`, file.originFileObj);
        });
      } else {
        console.error("No images selected");
      }


      if (groomNativeType === "Other" && brideNativeType === "Other") {
        toast.warn("If anyone of the marriage persons native type must be a member");
      } else {
        MarriageDetail(formData);
      }
      // console.log([...formData.entries()], 'adddd');
    }
  };

  const onFinishFailed = (value) => {
    toast.warn("Please fill in all the required details !");
  };

  const MarriageDetail = async (data) => {
    setIsloading(true)
    await request
      .post(`${APIURLS.POST_MARRIAGE_DETAILS}`, data)
      .then(function (response) {

        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Marriage Details Added Successfully",
          type: "success",
        });
        form.resetFields();
        dispatch(getmarriageDetails());
        setIsloading(false);
        return response.data;

      })
      .catch(function (error) {
        setIsloading(false);
        if (error.response.status === 400) {
          if (error.response.data?.bride_mobile_number) {
            toast.error(error.response.data?.bride_mobile_number[0])
          } else if (error.response.data?.groom_mobile_number) {
            toast.error(error.response.data?.groom_mobile_number[0])
          } else if (error.response.data?.non_field_errors) {
            toast.error(error.response.data?.non_field_errors[0])
          }
        } else {
          errorHandler(error);
        }

      });
  };

  const updateMarriageList = async (data) => {
    setIsloading(true)
    await request
      .put(`${APIURLS.PUT_MARRIAGE_DETAILS}${updatelist?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Marriage Details Updated Successfully",
          type: "info",
        });
        form.resetFields();
        closee();
        dispatch(getmarriageDetails());
        setIsloading(false)
        return response.data;
      })
      .catch(function (error) {
        setIsloading(false)
        if (error.response.status === 400) {
          if (error.response.data?.bride_mobile_number) {
            toast.error(error.response.data?.bride_mobile_number[0])
          } else if (error.response.data?.groom_mobile_number) {
            toast.error(error.response.data?.groom_mobile_number[0])
          } else if (error.response.data?.non_field_errors) {
            toast.error(error.response.data?.non_field_errors[0])
          }
        } else {
          setIsloading(false)
          errorHandler(error);
        }
      });
  };

  const onReset = () => {
    form.resetFields()
  }

  return (
    <Form
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{
        date: dayjs(),
      }}
    >
      <CustomCardView>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            {updatelist ? <CustomPageTitle Heading={"Update Marriage Detail"} /> :
              <CustomPageTitle Heading={"Add Marriage Detail"} />
            }
          </Col>
          <Col span={24} md={12}>
            <Flex flexend={"right"}>
              <CustomDatePicker
                label={"Date"}
                name={"date"}
                onChange={currentDate}
              />
            </Flex>
          </Col>
          <Col span={24} md={12} style={{ marginTop: "20px" }}>
            <StyledMarriageHeading>
              <p>Groom Details : </p>
            </StyledMarriageHeading>
            <CustomSelect
              label={"Groom Native Type"}
              name={"groom_native_type"}
              options={type} rules={[
                {
                  required: true,
                  message: 'Please Select a Groom Native Type !'
                },
              ]}
              //       options={type.filter(option => option.value !== brideNativeType || option.value === groomNativeType)}
              // value={groomNativeType}
              onChange={handleGroomNativeType}
            />
            {groomNativeType === "Member" ? (
              <>
                <CustomSelect
                  label={"Groom Family No"}
                  name={"groom_family_no"}
                  options={menDetail || []}
                  onChange={handleGroomFamilyID} />
                <CustomInput name={"groom_family"} display={"none"} />
                <CustomSelect
                  label={"Groom Member"}
                  name={"groom_name"}
                  options={getMenOptions || []}
                  onChange={handleMen} />
                <CustomInput name={"groom_member"} display={"none"} />
              </>
            ) : null}
            {groomNativeType === "Other" ? (
              <CustomInput label={"Groom Name"} name={"groom_name"} />
            ) : null}
            <CustomDatePicker
              label={"Groom Date of Birth"}
              name={"groom_dob"}
              onChange={handleGroomDOB}
              disabled={dobDiisbled}
              rules={[
                {
                  required: true,
                  message: "Please Choose a Groom Date of Birth !",
                },
              ]}
            />
            <CustomInputNumber
              label={"Groom Mobile Number"}
              name={"groom_mobile_number"}
              maxLength={10}
              rules={[
                {
                  required: true,
                  message: "Please enter a Groom Mobile Number !",
                },
              ]}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
            />
            {groomNativeType === "Other" ? null :
              <CustomInputNumber
                label={"Groom Marriage Amount"}
                name={"groom_marriage_amt"}
                suffix={"₹"}
                rules={[
                  {
                    required: true,
                    message: 'Please Enter a Groom Marriage Amount !',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (parseFloat(value) <= 0) {
                        return Promise.reject('Amount must be greater than 1 !');
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              />

            }

            {/* <CustomInputNumber label={'Groom Pending Amount'} name={'groom_pending-amt'} suffix={'₹'} /> */}
            <CustomTextArea label={"Groom Address"} name={"groom_address"} />
          </Col>

          <Col span={24} md={12} style={{ marginTop: "20px" }}>
            <StyledMarriageHeading>
              <p>Bride Details : </p>
            </StyledMarriageHeading>
            <CustomSelect
              label={"Bride Native Type"}
              name={"bride_native_type"}
              options={type} rules={[
                {
                  required: true,
                  message: 'Please Select a Bride Native Type'
                },
              ]}
              //       options={type.filter(option => option.value !== groomNativeType || option.value === brideNativeType)}
              // value={brideNativeType}
              onChange={handleBrideNativeType}
            />
            {brideNativeType === "Member" ? (
              <>
                <CustomSelect
                  label={"Bride Family No"}
                  name={"bride_family_no"}
                  options={womenDetail || []}
                  onChange={handleBrideFamilyID}
                />
                <CustomInput name={"bride_family"} display={"none"} />
                <CustomSelect
                  label={"Bride Member"}
                  name={"bride_name"}
                  options={getWomenOptions || []}
                  onChange={handlewoMen}
                />
                <CustomInput name={"bride_member"} display={"none"} />
              </>
            ) : null}
            {brideNativeType === "Other" ? (
              <CustomInput label={"Bride Name"} name={"bride_name"} />
            ) : null}
            <CustomDatePicker
              label={"Bride Date of Birth"}
              name={"bride_dob"}
              onChange={handleBrideDOB}
              disabled={dateDisbled}
              rules={[
                {
                  required: true,
                  message: 'Please Choose a Bride Date of Birth'
                },
              ]} />
            <CustomInputNumber
              label={"Bride Mobile Number"}
              name={"bride_mobile_number"}
              maxLength={10}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Bride Mobile Number",
                },
              ]}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
            />


            {brideNativeType === "Other" ? null :
              <CustomInputNumber
                label={"Bride Marriage Amount"}
                name={"bride_marriage_amt"}
                suffix={"₹"}
                rules={[
                  {
                    required: true,
                    message: 'Please Enter a Bride Marriage Amount !',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (parseFloat(value) <= 0) {
                        return Promise.reject('Amount must be greater than 1 !');
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              />

            }

            {/* <CustomInputNumber label={'Bride Pending Amount'} name={'bride_pending_amount'} suffix={'₹'} /> */}
            {/* <CustomInputNumber label={'Bride Pending Amount Pay'} name={'Bride Pending Amount Pay'} suffix={'₹'} /> */}
            <CustomTextArea label={"Bride Address"} name={"bride_address"} />
          </Col>

          <Col span={24} md={24}>
            <StyledMarriageHeading>
              <p>Marriage Details : </p>
            </StyledMarriageHeading>
          </Col>

          <Col span={24} md={12}>
            <CustomDatePicker
              label={"Marriage Date"}
              name={"marriage_date"}
              rules={[{ required: true, message: `Please select a Marriage Date` }]}
              onChange={handlemarriagedate}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomInput label={"Marriage Place"} name={"marriage_place"}
              rules={[{ required: true, message: "Please select a Marriage Place" }]} />
          </Col>

          <Col span={24} md={12}>
            <CustomUpload
              label={"Marriage Photo"}
              name={"marriage_photo"}
              listType="picture-card"
              maxCount={1}
              accept=".png,.jpeg,.jpg"
              form={form}
              initialValue={marriagephotoIntialValue}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomUpload
              label={"Marriage Certificate"}
              name={"marriage_certificate"}
              listType="picture-card"
              form={form}
              initialValue={marriagecertificateIntialValue}
              maxCount={1}
              accept=".pdf,.doc,.docx"

            />
          </Col>

          <Col span={24} md={12}>
            <CustomUpload
              label={"Invitation Document"}
              name={"invitation"}
              listType="picture-card"
              maxCount={1}
              accept=".pdf,.doc,.docx"
              form={form}
              initialValue={invitationIntialValue}

            />
          </Col>

          <Col span={24} md={12}>
            <CustomTextArea label={"Comments"} name={"comments"} />
          </Col>
        </CustomRow>


        {isloading ?
          <Flex center gap={'20px'} style={{ margin: '30px' }}><Spin /></Flex>
          : <Flex gap={"20px"} center={"true"} margin={"20px 0"}>
            {updatelist ? (
              <>
                <Button.Success text={"Update"} htmlType={"submit"} />
                <Button.Danger text={"Cancel"} onClick={() => closee()} />
              </>
            ) : (
              <>
                <Button.Danger text={"Submit"} htmlType={"submit"} />
                <Button.Success text={"Reset"} onClick={() => onReset()} />
              </>
            )}

          </Flex>}

      </CustomCardView>
    </Form>
  );
};

export default Marriage;
