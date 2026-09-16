import {
  CustomDatePicker,
  CustomInput,
  CustomInputNumber,
  CustomSelect,
  CustomSwitch,
  CustomUpload,
} from "@components/form";
import { CustomCardView, CustomRow, Flex } from "@components/others";
import { Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { StyledAdd, StyledHeading } from "../style";
import dayjs from "dayjs";
import { IMG_BASE_URL } from "@request/request";
import { toast } from "react-toastify";
import Label from "@components/form/Label";

export const AddMemberDetails = ({
  updatetriggermember,
  memberrecord,
  CloseForm,
  trigger,
  updateTrigger,
  SetDynamicTable,
  SetDynamicEditTable,
  index,
  radioBtncheck,
  setRadioBtncheck,
  familyrecord,
}) => {
  const [form] = Form.useForm();
  
  const [imageUrl, setImageUrl] = useState([]);
  const [sendImgValue, setSendImg] = useState([]);
  const [dateofbirth, setDateofBirth] = useState(null);
  const [DateofDeath, setDateofDeath] = useState(dayjs().format("YYYY-MM-DD"));
  const [initialImageValue, setImageInitialValue] = useState([]);
  const [persoStatus, setPersoStatus] = useState(false);
  const [imgTrigger, setImgTrigger] = useState(0);

  const relationshiptypeoption = [
    {
      label: "FATHER",
      value: "FATHER",
    },
    {
      label: "WIFE",
      value: "WIFE",
    },
    {
      label: "SON",
      value: "SON",
    },
    {
      label: "DAUGHTER",
      value: "DAUGHTER",
    },
  ];

  useEffect(() => {
    form.resetFields();
    setRadioBtncheck(familyrecord?.head_member_type)
  }, [trigger, updatetriggermember]);

  useEffect(() => {
    if (memberrecord) {
      SetMemberDetails();
    }
    if (familyrecord && familyrecord?.head_member_type === "EXCISTING") {
     
      if(radioBtncheck === "NEW"){
        form.setFieldsValue({
          member_joining_amt: memberrecord?.member_joining_amt,
        });

      }
      else{
        form.setFieldsValue({
          member_balance_amt: memberrecord?.member_balance_amt,
        });
        setRadioBtncheck(familyrecord?.head_member_type);
      }
     
    } else if (familyrecord && familyrecord?.head_member_type === "NEW") {
   
      if(radioBtncheck === "EXCISTING"){
        form.setFieldsValue({
          member_balance_amt: memberrecord?.member_balance_amt,
        });

      }
      else{
        form.setFieldsValue({
          member_joining_amt: memberrecord?.member_joining_amt,
        });
        setRadioBtncheck(familyrecord?.head_member_type);
      }
    }
  }, [memberrecord, familyrecord, updateTrigger, updatetriggermember]);

  const SetMemberDetails = () => {

    const dateFormat = "YYYY-MM-DD";
    const dateofdeath = new Date(memberrecord?.death_date);
    // DateofDeath

    const MemberDEATH = dayjs(dateofdeath).format(dateFormat);

    form.setFieldsValue(memberrecord);
    const formattedDate = dayjs(memberrecord?.member_dob, "YYYY-MM-DD");
    {
      memberrecord.member_dob &&
        form.setFieldsValue({ member_dob: formattedDate });
    }
   {memberrecord.death_date === null ? form.setFieldsValue({death_date:""}):form.setFieldsValue({death_date:dayjs(MemberDEATH,dateFormat)})} 
    form.setFieldsValue({
      // death_date: dayjs(MemberDEATH, dateFormat),
      member_photo: initialImageValue,
      // member_balance_amt: memberrecord?.member_balance_amt,
    });
    // setRadioBtncheck(memberrecord?.member_balance_amt)
    setPersoStatus(memberrecord?.death);
    setDateofDeath(memberrecord?.death_date)
  };

  // console.log(dateofbirth, "dateofbirth");
  useEffect(() => {
    if (memberrecord?.member_photo?.length > 0) {
      setImageInitialValue([
        {
          uid: "1",
          name: "uploaded image",
          status: "done",
          url: `${memberrecord?.member_photo}`,
        },
      ]);
    } else {
      setImageInitialValue([]);
    }
  }, [memberrecord, updatetriggermember]);

  const onReset = () => {
    form.resetFields();
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  // console.log(initialImageValue, "initialImageValue");

  const handleOnChange = async (img) => {
    setImgTrigger(imgTrigger + 1);
    // console.log(img, "imgggg");
    setSendImg(img.fileList);

    if (img.fileList.length > 0) {
      const ImageObj = await Promise.all(
        img.fileList.map(async (value) => {
          // Assuming getBase64 returns a Promise
          const base64Result = await getBase64(value.originFileObj);

          // Now, you can use base64Result
          const newObj = {
            id: imageUrl.length + 1,
            variantproduct_image: base64Result,
          };
          return newObj;
        })
      );
      setImageUrl(ImageObj);
    }
  };

  const handleDob = (date) => {
    // console.log(date, "date");
    setDateofBirth(date);
  };

  const setDateonchange = (date) => {
    setDateofDeath(date);
  };

  const handlePersonstatus = (value) => {
    setPersoStatus(value);
    form.resetFields(["death_date"])
  };
  // console.log(radioBtncheck, "radioBtncheck");

  // console.log(imageUrl[0]?.variantproduct_image, "imageUrl");
  // console.log(imageUrl, "imageUrl");
  // console.log(memberrecord, "memberrecord");


  const onFinish = (data) => {

    if (!radioBtncheck && (!familyrecord || !familyrecord?.head_member_type)) {
      toast.warn("Please check either Existing or New !");
      return;
    }

    let result = {
      member_name: data?.member_name,
      member_relation_ship: data?.member_relation_ship,
      member_mobile_number: data?.member_mobile_number,
      member_email: data?.member_email,
      member_joining_amt: data?.member_joining_amt,
      member_balance_amt: data?.member_balance_amt,
      death: persoStatus,
      // death_date: DateofDeath,
      death_date: persoStatus === true ? DateofDeath : null,
      member_dob: dateofbirth || memberrecord?.member_dob,
      member_photo:
        data.member_photo && data.member_photo.length > 0
          ? data.member_photo[0]?.status === "done" ? data.member_photo[0]?.url : data.member_photo === "" ? "": imageUrl[0]?.variantproduct_image: "",
      image_send_value: sendImgValue,
      key: data.key,
    };
    // console.log(imageUrl, "imageUrl");
    // console.log(initialImageValue[0]?.url, "initialImageValue");
    console.log(result, "EEEresult");
    if (memberrecord) {
      const newrec = { ...result, id: data?.id };
      SetDynamicEditTable(newrec);
      CloseForm();
    } else {
      SetDynamicTable(result);
      form.resetFields();
      setPersoStatus(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  return (
    <Form
      form={form}
      name="new"
      labelCol={{
        span: 24,
      }}
      wrapperCol={{
        span: 24,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
     
      <CustomCardView>
        <CustomRow space={[12, 12]}>
          <Col span={24} md={24}>
            <StyledHeading>
              <p>Member Details</p>
            </StyledHeading>
          </Col>
          <Col span={24} md={12}>
            <CustomInput
              label={"Name"}
              name={"member_name"}
              rules={[
                {
                  required: true,
                  message: "Please Enter Member Name!",
                },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              label={"Relationship"}
              name={"member_relation_ship"}
              placeholder={"Choose"}
              options={relationshiptypeoption}
              rules={[
                {
                  required: true,
                  message: "Please Select Relationship Type!",
                },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Mobile Number"}
              name={"member_mobile_number"}
              maxLength={10}
              minLength={10}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              rules={[
                {
                  required: true,
                  message: "Please Enter Mobile Number!",
                },
              ]}
            />
            <CustomInput name={"key"} display={"none"} />
            <CustomInput name={"id"} display={"none"} />
          </Col>

          <Col span={24} md={12}>
            <CustomInput
              label={"Email"}
              name={"member_email"}
              type={"email"}
              // rules={[
              //     {
              //         required: true,
              //         message: 'Please Enter Email Id !',
              //     }
              // ]}
            />
          </Col>
          {radioBtncheck === "NEW" ? (
            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Joining Amount"}
                name={"member_joining_amt"}
                precision={2}
                // min={1.0}
                defaultValue={0}
              />
            </Col>
          ) : null}

          {radioBtncheck === "EXCISTING" ? (
            <Col span={24} md={12}>
              <CustomInputNumber
                label={"Opening Balance Amount"}
                name={"member_balance_amt"}
                precision={2}
                // min={1.0}
                defaultValue={0}
              />
            </Col>
          ) : null}

          <Col span={24} md={12}>
            <CustomDatePicker
              label={"Date of Birth"}
              name={"member_dob"}
              onChange={handleDob}
              rules={[
                {
                  required: true,
                  message: "Please choose a date of birth! !",
                },
              ]}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomUpload
              label={"Photo"}
              name={"member_photo"}
              onChange={handleOnChange}
              form={form}
              maxCount={1}
              initialValue={initialImageValue}
            />
          </Col>
          <Col span={24} md={24}></Col>
          <Col span={24} md={12}>
            <Label>Person status</Label>
            <CustomSwitch
              leftLabel={"Live"}
              rightLabel={"Death"}
              name={"death"}
              checked={persoStatus}
              onChange={handlePersonstatus}
            />
          </Col>
          {persoStatus ? (
            <Col span={24} md={12}>
              <CustomDatePicker
                label={"Death Date"}
                name={"death_date"}
                onChange={setDateonchange}
                rules={[
                  {
                    required: true,
                    message: "Required",
                  },
                ]}
              />
            </Col>
          ) : null}

          <Col span={24} md={24}>
            <br />
            <Flex center>
              <StyledAdd htmlType="submit">
                <h3>Add</h3>
              </StyledAdd>
            </Flex>
          </Col>
        </CustomRow>
      </CustomCardView>
    </Form>
  );
};
