import {
  CustomUpload,
  CustomInputNumber,
  CustomDatePicker,
  CustomSelect,
  CustomTextArea,
  Button,
  CustomInput,
} from "@components/form";
import { CustomCardView, CustomRow, Flex } from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { useSelector } from "react-redux/es/hooks/useSelector";
import { Col, Form, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import request from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import dayjs from "dayjs";
import { getDeath, selectDeathDetail } from "../DeathSlice";
import { getDeathList } from "../DeathSlice";
import { toast } from "react-toastify";

const DeathForm = ({ updatedeath, deathtrigger, closee }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [selectedMember, setSelectedMember] = useState([]);
  const [memberdetail, setMemberDetail] = useState([]);
  const [selecteDefaultDate, setSelecteDefaultDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedDeadDate, setSelectedDeadDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [penaltydate, setPenaltyDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [isloading, setIsloading] = useState(false)
  const [ImageIntialValue, setImageIntialValue] = useState([]);
  const [PhotoIntialValue, setPhotoIntialValue] = useState([]);
  const [tyeamt, setTyeamt] = useState("Percentage");
  const [disablePenalty, setDisablePenalty] = useState(false);

  useEffect(() => {
    dispatch(getDeathList());
    dispatch(getDeath());
  }, []);
  const DeathDetails = useSelector(selectDeathDetail);

  useEffect(() => {
    form.setFieldsValue({ member_name: memberdetail });
  }, [memberdetail]);
  //-------------- Family Number Options ------------------------
  const FamilyNumbersOptions = DeathDetails?.map((extra) => ({
    label: extra.family_no,
    value: extra.id,
  }));

  //-----------------------------
  useEffect(() => {
    if (updatedeath?.death?.documents?.length > 0) {
      setImageIntialValue([
        {
          uid: "1",
          name: "uploaded document",
          status: "done",
          url: `${updatedeath?.death?.documents}`,
        },
      ]);
    } else {
      setImageIntialValue([]);
    }
  }, [updatedeath, deathtrigger]);

  useEffect(() => {
    if (updatedeath?.death?.photo?.length > 0) {
      setPhotoIntialValue([
        {
          uid: "1",
          name: "uploaded image",
          status: "done",
          url: `${updatedeath?.death?.photo}`,
        },
      ]);
    } else {
      setPhotoIntialValue([]);
    }
  }, [updatedeath, deathtrigger]);

  const optionpanalty = [
    {
      label: "%",
      value: "Percentage",
    },
    {
      label: "₹",
      value: "Amount",
    },
  ];

  useEffect(() => {
    if (updatedeath) {
      SetDeathDetails();
    }
  }, [updatedeath, deathtrigger]);

  const SetDeathDetails = () => {
    const deathofdate = new Date(updatedeath?.death?.death_date);
    const dateFormat = "YYYY-MM-DD";
    const deathDate = dayjs(deathofdate).format(dateFormat);

    const deathofday = new Date(updatedeath?.death?.date);
    const deathday = dayjs(deathofday).format(dateFormat);

    const penaltydate = new Date(updatedeath?.death?.penalty_apply_date);
    const penaltyday = dayjs(penaltydate).format(dateFormat);
    setPenaltyDate(penaltyday);

    form.setFieldsValue(updatedeath);
    form.setFieldsValue({
      death_date: dayjs(deathDate, dateFormat),
      date: dayjs(deathday, dateFormat),
      penalty_apply_date: dayjs(penaltyday, dateFormat),
    });

    form.setFieldsValue(updatedeath);
    form.setFieldsValue({ member_name: updatedeath?.death?.member_name });
    form.setFieldsValue({ member: updatedeath?.death?.member });
    form.setFieldsValue({ death_amt: updatedeath?.death?.death_amt });
    form.setFieldsValue({ amount_details: updatedeath?.death?.amount_details });
    form.setFieldsValue({ comments: updatedeath?.death?.comments });
    form.setFieldsValue({ image: ImageIntialValue });
    form.setFieldsValue({
      death_tariff_amt: updatedeath?.death?.death_tariff_amt,
    });
    form.setFieldsValue({
      tariff_peanalty: updatedeath?.death?.tariff_peanalty,
    });
    form.setFieldsValue({ pen_amt_type: updatedeath?.death?.pen_amt_type });
    setTyeamt(updatedeath?.death?.pen_amt_type)

    if (updatedeath?.death?.tariff_peanalty > 100 && updatedeath?.death?.pen_amt_type === "Percentage") {
      // Legacy record still has an invalid >100% value. Fall back to Amount so
      // the user can see the raw number but cannot re-save without correction.
      form.setFieldsValue({ pen_amt_type: "Amount" })
      setDisablePenalty(true)
    }
    else {
      setDisablePenalty(false)
    }
  };

  useEffect(() => {
    const FamilyMembersOptions = DeathDetails?.find(
      (value) => value?.id === updatedeath?.family_no
    );
    setSelectedMember(FamilyMembersOptions);

  }, [DeathDetails, updatedeath])

  //-----------------------  Handle penalty date ----------------
  const HandlepenaltyDate = (pdate) => {
    setPenaltyDate(pdate);
  };
  //--------------- handle Default date show -------------------
  const handleDate = (date) => {
    setSelecteDefaultDate(date)
  }
  //-------------- handle Death date --------------------------

  const handleDeathDate = (date) => {
    setSelectedDeadDate(date)
  }
  //------------------- Death Family ---------------------------

  const handleDeathfamily = (fam) => {
    const DeathFormDetails = DeathDetails?.find((val) => val?.id === fam);
    setSelectedMember(DeathFormDetails);
    setMemberDetail([]);
  };
  //------------------ Death Person -----------------------------


  const handleDeathPerson = (person) => {
    const DeathPerson = selectedMember?.family_members?.find(
      (value) => value.id === person
    );
    setMemberDetail(DeathPerson?.member_name);
    form.setFieldsValue({ member: DeathPerson?.id });
  };

  //--------------- Family MemberOptions -------------------------
  const FamilyMembersOptions = selectedMember?.family_members?.map((extra) => ({
    label: `${extra?.member_name} / ${extra?.member_mobile_number}`,
    value: extra.id,
  }));

  //-------------- Handle Tariff penalty Type---------------------
  const handleamttype = (value) => {
    setTyeamt(value);
  };
  //----------------- Handle Tariff Penalty Amt/Per--------------------
  // NOTE: Previously, entering >100 auto-switched the penalty type to "Amount".
  // Per business rule, percentages are strictly capped at 100 %, so we no
  // longer silently reinterpret the value. Instead the field validator (below)
  // rejects the submission and keeps the user's chosen type intact.
  const handlePenaltyValue = () => {
    setDisablePenalty(false);
  };
  //--------------------------------------

  const DeathFormDetail = async (data) => {
    setIsloading(true)
    await request
      .post(`${APIURLS.POST_dEATHFORMDETAILS}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Death Details Added Successfully",
          type: "success",
        });
        form.resetFields();
        dispatch(getDeathList());
        setMemberDetail([]);
        setSelectedMember([]);
        setIsloading(false)
        return response.data;
      })
      .catch(function (error) {
        setIsloading(false)
        // console.log(error.response, 'errrrrrrr');
        if (error.response.status === 400) {
          if (error.response.data?.penalty_apply_date) {
            toast.error(error.response.data?.penalty_apply_date[0]);
          }
          if (error.response.data?.death_date) {
            toast.error(error.response.data?.death_date[0]);
          }
          if (error.response.data?.tariff_peanalty) {
            toast.error(error.response.data?.tariff_peanalty[0]);
          }

        } else {
          errorHandler(error);
        }
      });
  };

  const updateDeathForm = async (data) => {
    setIsloading(true);

    try {
      const response = await request.put(`${APIURLS.PUT_DEATHFORMDETAILS}${updatedeath?.death?.id}/`, data);
      successHandler(response, {
        notifyOnSuccess: true,
        notifyOnFailed: true,
        msg: "Death Details Updated Successfully",
        type: "info",
      });

      form.resetFields();
      dispatch(getDeath());
      closee();
      setMemberDetail([]);
      setSelectedMember([]);
      setIsloading(false);

      return response.data;
    } catch (error) {
      setIsloading(false);
      // console.log(error.response, 'deatterror');
      if (error.response) {
        const { status, data } = error.response;

        if (status === 302 && data?.message) {
          toast.error(data.message);
        }
        if (status === 400 && data?.documents) {
          toast.error(data.documents);
        }
        if (status === 400 && data?.death_date) {
          toast.error(error.response.data?.death_date[0]);
        }
        if (status === 400 && data?.penalty_apply_date) {
          toast.error(data?.penalty_apply_date[0])
        }
      } else {
        console.error(error);
      }
    }
  };

  const onFinish = (value) => {
    if (updatedeath) {
      const formData = new FormData();
      formData.append("date", selecteDefaultDate);
      formData.append("member_name", value?.member_name);
      formData.append("amount_details", value?.amount_details || 0);
      formData.append("death_date", selectedDeadDate);
      formData.append("death_amt", value?.death_amt || 0);
      formData.append("member", Number(value?.member)); // Convert to a number if it's a string
      formData.append("death_tariff_amt", value?.death_tariff_amt || 0);
      formData.append("tariff_peanalty", value?.tariff_peanalty || 0);
      formData.append("penalty_apply_date", penaltydate);
      formData.append("pen_amt_type", tyeamt);
      formData.append("comments", value?.comments || '');

      if (value?.documents.length === 0) {
        formData.append("documents_status", "false");
      } else if (!value?.documents[0]?.url) {
        formData.append("documents", value?.documents[0].originFileObj);
      }
      if (value?.photo.length === 0) {
        formData.append("photo_status", "false");
      } else if (!value?.photo[0]?.url) {
        formData.append("photo", value?.photo[0].originFileObj);
      }
      updateDeathForm(formData);
      // console.log([...formData.entries()], "deathupdate");
    } else {
      const formData = new FormData();
      formData.append("date", selecteDefaultDate);
      formData.append("member", value?.member);
      formData.append("member_name", value?.member_name);
      formData.append("amount_details", value?.amount_details || 0);
      formData.append("death_date", selectedDeadDate);
      formData.append("death_amt", value?.death_amt || 0);
      formData.append("death_tariff_amt", value?.death_tariff_amt || 0);
      formData.append("tariff_peanalty", value?.tariff_peanalty || 0);
      formData.append("penalty_apply_date", penaltydate);
      formData.append("pen_amt_type", tyeamt);
      formData.append("comments", value?.comments || '');

      if (value?.documents && value.documents.length > 0) {
        value.documents.forEach((file) => {
          formData.append(`documents`, file.originFileObj);
        });
      } else {
        console.error("No documents selected");
      }

      if (value?.photo && value.photo.length > 0) {
        value.photo.forEach((file) => {
          formData.append(`photo`, file.originFileObj);
        });
      } else {
        console.error("No images selected");
      }

      DeathFormDetail(formData);
      // console.log([...formData.entries()], 'Add');
    }
  };
  //------------- onfinish end

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };

  const SelectSide = (
    <CustomSelect
      options={optionpanalty}
      initialValue={tyeamt}
      name={"pen_amt_type"}
      width={"70px"}
      onChange={handleamttype}
      disabled={disablePenalty}
    />
  );

  const onReset = () => {
    form.resetFields();
  };
  return (
    <Form
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      initialValues={{ date: dayjs() }}
    >
      <CustomCardView>
        <CustomRow space={[24, 24]}>
          <Col span={24} md={12}>
            {updatedeath ? <CustomPageTitle Heading={"Update Death"} /> : <CustomPageTitle Heading={"Death Form"} />}

          </Col>
          <Col span={24} md={12}>
            <Flex flexend={"right"}>
              <CustomDatePicker
                name={"date"}
                onChange={handleDate}
                disabled={true}
              />
            </Flex>
          </Col>
          {updatedeath?.death?.old_death !== true &&
            <>
              <Col span={24} md={12}>
                <CustomSelect
                  label={"Family No"}
                  name={"family_no"}
                  options={FamilyNumbersOptions || []}
                  onChange={handleDeathfamily}
                  disabled={updatedeath ? true : false}
                  rules={[{ required: true, message: "Please select a family no !" }]}
                />
              </Col>

              <Col span={24} md={12}>
                <CustomSelect
                  label={"Member Name"}
                  name={"member_name"}
                  disabled={updatedeath ? true : false}
                  options={FamilyMembersOptions || []}
                  onChange={handleDeathPerson} rules={[{ required: true, message: "Please select a member name !" }]}
                />
                <CustomInput name={"member"} display={"none"} />
              </Col>
            </>}
          <Col span={24} md={12}>
            <CustomDatePicker
              label={"Death Date"}
              name={"death_date"}
              onChange={handleDeathDate} rules={[{ required: true, message: "Please select a date !" }]}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomUpload
              form={form}
              label={"Document (optional)"}
              name={"documents"}
              listType="picture-card"
              maxCount={1}
              accept=".pdf,.doc,.docx"
              initialValue={ImageIntialValue}
            />
          </Col>
          {updatedeath?.death?.old_death !== true &&
            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Death Tariff amount"}
                name={"death_tariff_amt"}
                suffix={"₹"}
                rules={[
                  {
                    required: true,
                    message: "Please enter a tariff amount !",
                  },
                ]}
              />
            </Col>}
          <Col span={24} md={12}>
            <CustomUpload
              form={form}
              label={"Photo"}
              name={"photo"}
              listType="picture-card"
              maxCount={1}
              accept=".png,.jpeg,.jpg"
              initialValue={PhotoIntialValue}
            />
          </Col>
          {updatedeath?.death?.old_death !== true &&
            <>
              <Col span={24} md={12}>
                <CustomDatePicker
                  name={"penalty_apply_date"}
                  label={"penalty Apply Date"}
                  onChange={HandlepenaltyDate}
                  rules={[{ required: true, message: "Please select a penalty date !" }]}
                />
              </Col>

              <Col span={24} md={12}>
                <CustomInputNumber
                  addonAfter={SelectSide}
                  label={"Tariff penalty"}
                  name={"tariff_peanalty"} rules={[
                    { required: true, message: "Please enter a tariff penalty !" },
                    {
                      validator: (_, value) => {
                        if (
                          tyeamt === "Percentage" &&
                          value !== undefined &&
                          value !== null &&
                          Number(value) > 100
                        ) {
                          return Promise.reject(
                            new Error("Tariff penalty percentage cannot exceed 100%")
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                  onChange={handlePenaltyValue}
                />
              </Col>
            </>}
          {updatedeath?.death?.old_death !== true &&
            <Col span={24} md={12}>
              <CustomTextArea label={"Comments"} name={"comments"} />
            </Col>}
        </CustomRow>
        {isloading ? (
          <Flex center gap={"20px"} style={{ margin: "30px" }}>
            <Spin />
          </Flex>
        ) : (
          <Flex gap={"20px"} center={"true"} margin={"20px 0"}>
            {updatedeath ? (
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
          </Flex>
        )}
      </CustomCardView>
    </Form>
  );
};

export default DeathForm;
