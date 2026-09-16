import {
  Button,
  CustomInput,
  CustomInputNumber,
  CustomSelect,
} from "@components/form";
import {
  CustomCardView,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageFormTitle, CustomPageTitle } from "@components/others/CustomPageTitle";
import { getAsset } from "@modules/Asset Details/AssetSlice";
import {
  getMembersDetails,
  selectMemberDetails,
} from "@modules/FamilyDetails/FamilySlice";
import { getAssetUnderCategory, getRentalAssetCategory, selectRentalAssetCategoryDetails } from "@modules/Rental/RentalorLease/RentalorLeaseSlice";
import { Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const MovableRentalAdd = ({ rentalRecord, SetDynamicEditTable, SetDynamicTable, handleOk, updateTrigger, MainMovableReocrd }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [categoryDeatils, setCategoryDetails] = useState([])
  const [saleQty, setSaleQty] = useState(false)
  const [saleMaxqty, setSaleMaxqty] = useState()

  useEffect(() => {
    dispatch(getRentalAssetCategory());
    dispatch(getMembersDetails());
    dispatch(getAsset());
    dispatch(getAssetUnderCategory());
  }, []);

  const AllMovableAssetCategory = useSelector(selectRentalAssetCategoryDetails);
  const AllMemberDetails = useSelector(selectMemberDetails);

  useEffect(() => {
    form.setFieldsValue(rentalRecord)
    const AsseCategorytDetails = AllMovableAssetCategory?.find((val) => val.category?.id === rentalRecord?.category);
    setCategoryDetails(AsseCategorytDetails)
  }, [rentalRecord, updateTrigger, AllMovableAssetCategory])

  //--------------- Handle Asset Category function -------------------

  const handleAssetCatery = (catvalue) => {
    const AsseCategorytDetails = AllMovableAssetCategory?.find((val) => val.category?.id === catvalue);
    setCategoryDetails(AsseCategorytDetails)
    form.setFieldsValue({ asset_category_name: AsseCategorytDetails?.category?.categoryname });
    if (catvalue) {
      form.resetFields(["asset", "asset_name", "avilable_qty", "sale_amt", "qnty"])
    }
  };
  //--------------- Handle Asset name function -------------------

  const handleAsset = (value) => {
    const AssetDetails = categoryDeatils?.assets?.find((val) => val.id === value);

    form.setFieldsValue({ asset_name: AssetDetails?.asset_name })
    form.setFieldsValue({ avilable_qty: AssetDetails?.avilable_qty })
    form.setFieldsValue({ sale_amt: AssetDetails?.per_sale_amt })

  }
  //------------ Handle Quantity onChage Function --------

  const handleQtyChange = (e) => {
    let AvailableQty = parseFloat(form.getFieldValue("avilable_qty"));
    const TotalQty = e;

    if (TotalQty > AvailableQty) {
      toast.warn("Sale Qty not greater than Available Qty !");
      setSaleQty(true);
      setSaleMaxqty(AvailableQty)
    } else {
      setSaleQty(false);
      AvailableQty = TotalQty;
      setSaleMaxqty("")
    }
  }

  //----------- Asset-category options---------------------

  const Categoryoptions = AllMovableAssetCategory?.map((assetcat) => ({
    label: assetcat?.category?.categoryname,
    value: assetcat?.category?.id,
  }));

  //----------- Asset Name options---------------------

  const Assetoptions = categoryDeatils?.assets?.map((asename) => ({
    label: asename?.asset_name,
    value: asename?.id
  }));

  //-------------- MemberOptions-----------------------

  const newSet = new Set();
  const memberoptions = AllMemberDetails?.map((memberlist) => ({
    label: memberlist?.member?.member_name,
    value: memberlist?.member?.member_name,
  }));

  if (memberoptions) {
    memberoptions.forEach((item) => {
      newSet.add(item.label);
    });
  }
  //----------------

  const onFinish = (values) => {
    const newData = {
      asset_category_name: values?.asset_category_name,
      category: values?.category,
      asset_name: values?.asset_name,
      asset: values?.asset,
      avilable_qty: values?.avilable_qty,
      qnty: values?.qnty,
      sale_amt: values?.sale_amt,
      total_amt: parseFloat(values.qnty) * parseFloat(values.sale_amt),
      key: values.key,
    };

    if (rentalRecord) {
      const newrec = { ...newData, id: values?.id };
      SetDynamicEditTable(newrec);
      handleOk();

    } else {
      SetDynamicTable(newData);
      form.resetFields();
    }
  };

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };

  return (
    <Form
      name="AddMovableRentalcategory"
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
    >
      <CustomCardView>
        <CustomRow space={[24,24]}>
          <Col span={24} md={12}>
          <CustomPageFormTitle Heading={"Add Movable Rental :"} />
          </Col>
          <Col span={24} md={12}>

          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              label={"Asset Category"}
              name={"category"}
              options={Categoryoptions || []}
              onChange={handleAssetCatery}
              rules={[
                {
                  required: true,
                  message: "Please Select a Asset Category!",
                },
              ]}
            />
            <CustomInput name={"asset_category_name"} display={'none'} />
          </Col>
          <Col span={24} md={12}>
            <CustomSelect
              label={"Asset Name"}
              name={"asset"}
              options={Assetoptions || []}
              onChange={handleAsset}
              rules={[
                {
                  required: true,
                  message: "Please Select a Asset Name!",
                },
              ]}
            />
            <CustomInput name={"asset_name"} display={'none'} />
          </Col>
          {!MainMovableReocrd &&
            <Col span={24} md={12}>
              <CustomInput
                label={"Available Quantity"}
                name={"avilable_qty"}
                disabled
              />
            </Col>}
          <Col span={24} md={12}>
            <CustomInputNumber
              label={"Sale Amount"}
              name={"sale_amt"}
              precision={2}
              suffix={"₹"}
              defaultValue={0}
              disabled
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              name={"qnty"}
              label={"Sale Quantity"}
              onChange={handleQtyChange}
              max={saleMaxqty}
              rules={[
                {
                  required: true,
                  message: "Please Enter a quantity!",
                },
              ]}
            />
          </Col>
          <CustomInput name={"key"} display={"none"} />
        </CustomRow>
        <Flex center={"true"} gap={"20px"} margin={"30px"}>
          {rentalRecord ? <Button.Danger text={"Update"} htmlType={"submit"} disabled={saleQty} /> :
            <Button.Danger text={"Add"} htmlType={"submit"} disabled={saleQty} />
          }
        </Flex>
      </CustomCardView>
    </Form>
  );
};

export default MovableRentalAdd;
