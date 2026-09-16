import React from "react";
import {
  Button,
  CustomAddSelect,
  CustomInput,
  CustomInputNumber,
  CustomTextArea,
} from "@components/form";
import {
  CustomCardView,
  CustomModal,
  CustomRow,
  Flex,
} from "@components/others";
import { CustomPageTitle } from "@components/others/CustomPageTitle";
import { Col, Form, Spin } from "antd";
import { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import request, { IMG_BASE_URL } from "@request/request";
import { APIURLS } from "@request/apiUrls/urls";
import successHandler from "@request/successHandler";
import errorHandler from "@request/errorHandler";
import { toast } from "react-toastify";
import {
  getMovableAsset,
  getMovableAssetCategory,
  selectMovableAssetDetails,
} from "@modules/Asset Details/AssetSlice";
import { MovableAssestModal } from "./MovableAssestModal";

export const AddMovableAssest = ({ closeee, updatemovable, updatemovabletrigger }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch()

  // const [isloading, setIslooading] = useState(false)

  // ======  Modal Open ========
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelwith, setModelwith] = useState(0);
  const [modalTitle, setModalTitle] = useState();
  const [modalContent, setModalContent] = useState(null);

  const [trigger, setTrigger] = useState(0);
  const [isloading, setIsLoading] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };


  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    dispatch(getMovableAssetCategory());
  }, []);

  const AllMovableAssetCategory = useSelector(selectMovableAssetDetails);

  const AssetCategoryOptions = AllMovableAssetCategory?.map((assetcat) => ({
    label: assetcat?.categoryname,
    value: assetcat?.categoryname,
  }));

  useEffect(() => {
    if (updatemovable) {
      setUpdateDetails();
    }
  }, [updatemovable, updatemovabletrigger]);


  const setUpdateDetails = () => {

    form.setFieldsValue(updatemovable);

    form.setFieldsValue({ categoryname: updatemovable?.categoryname });
    form.setFieldsValue({ asset_name: updatemovable?.asset_name });
    form.setFieldsValue({ avilable_qty: updatemovable?.avilable_qty });
    form.setFieldsValue({ per_sale_amt: updatemovable?.per_sale_amt });
    form.setFieldsValue({ details: updatemovable?.details });
    form.setFieldsValue({ comments: updatemovable?.comments });

  }
  const AddAssetDetails = async (data) => {
    setIsLoading(true);
    await request
      .post(`${APIURLS.POST_MOVABLE_CATEGORY}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Asset Details Added Successfully",
          type: "success",
        });
        form.resetFields();
        // dispatch(getMovableAssetCategory());
        setIsLoading(false);
        return response.data;
      })
      .catch(function (error) {
        if(error.response.status === 406){
          toast.error(error.response.data.message);
          setIsLoading(false)
        }
        else{
          setIsLoading(false)
          return errorHandler(error);
        }
      });
  };

  const UpdateAssetDetails = async (data) => {
    // setIsLoading(true);
    await request
      .put(`${APIURLS.PUT_MOVEABLE_ASSET_DETAILS}${updatemovable?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Asset Details Updated Successfully",
          type: "info",
        });
        closeee()
        // form.resetFields();
        dispatch(getMovableAsset());
        // dispatch(getMovableAssetCategory());
        return response.data;

      })
      .catch(function (error) {

        if (error.response.status === 302) {
          toast.error(error.response.data?.message);
        } else {
          errorHandler(error);
        }

        setIsLoading(false);
        // console.log(error);
      });
  };

  const onFinish = (values) => {
    if (updatemovable) {
      const formData = new FormData();
      formData.append('category', values?.category);
      formData.append("category_name", values?.category_name);
      formData.append("asset_name", values?.asset_name);
      formData.append("avilable_qty", values?.avilable_qty);
      formData.append("per_sale_amt", values?.per_sale_amt);
      formData.append("details", values?.details);
      formData.append("comments", values?.comments);

      UpdateAssetDetails(formData);
      // console.log([...formData.entries()], "deathupdate");
    } else {
      const formData = new FormData();
      formData.append('category', values?.category);
      formData.append("category_name", values?.category_name);
      formData.append("asset_name", values?.asset_name);
      formData.append("avilable_qty", values?.avilable_qty);
      formData.append("per_sale_amt", values?.per_sale_amt);
      formData.append("details", values?.details);
      formData.append("comments", values?.comments);

      AddAssetDetails(values);
    }
    // console.log([...formData.entries()], 'Add');

  };

  const onFinishFailed = () => {
    toast.warn("Please fill in all the required details !");
  };

  const handleAssetCategory = (catval) => {
    const SelectedAssetCategory = AllMovableAssetCategory?.find(
      (cat) => cat.categoryname === catval
    );
    form.setFieldsValue({ category: SelectedAssetCategory?.id });
  };
  const handleClose = () => {
    handleOk();
    dispatch(getMovableAssetCategory());
  };

  const AddNewModal = () => {
    setTrigger(trigger + 1);
    setModelwith(500);
    setModalTitle("Add Movable Asset");
    setModalContent(
      <MovableAssestModal handleClose={handleClose} propertytrigger={trigger}  />
    );
    showModal();
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <Form
      name="AddMovableAssest"
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      form={form}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <CustomCardView>
        <CustomPageTitle Heading={"Movable Asset"} />
        <CustomRow space={[12, 12]}>
          <Col span={24} md={12}>
            <CustomAddSelect
              label={"Asset Category"}
              name={"category_name"}
              options={AssetCategoryOptions}
              onButtonClick={AddNewModal}
              onChange={handleAssetCategory}
              rules={[
                {
                  required: true,
                  message: "Please Select a Category Name !",
                },
              ]}
            />

            <CustomInput name={"category"} display={"none"} />
          </Col>

          <Col span={24} md={12}>
            <CustomInput
              label={"Asset Name"}
              name={"asset_name"}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Asset Name !",
                },
              ]}
            />
          </Col>
          <Col span={24} md={12}>
            <CustomInputNumber
              type={"number"}
              label={"Quantity"}
              name={"avilable_qty"}
              rules={[
                {
                  required: true,
                  message: "Please Enter a Quantity !",
                },
              ]}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomInputNumber
              type={"number"}
              label={"Sale Amount"}
              name={"per_sale_amt"}
              suffix={"₹"}
              rules={[
                {
                  required: true,
                  message: "Please Enter Sale Amount",
                },
              ]}
            />
          </Col>

          <Col span={24} md={12}>
            <CustomTextArea label={"Details"} name={"details"} />
          </Col>

          <Col span={24} md={12}>
            <CustomTextArea label={"Comments"} name={"comments"} />
          </Col>
        </CustomRow>

        {isloading ? (
          <Flex center gap={"20px"} style={{ margin: "30px" }}>
            <Spin />
          </Flex>
        ) : (
          <Flex gap={"20px"} center={"true"} margin={"20px 0"}>
            {updatemovable ? (
              <>
                <Button.Success text={"Update"} htmlType={"submit"} />
                <Button.Danger text={"Cancel"} onClick={() => closeee()} />
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
      <CustomModal
        isVisible={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        width={modelwith}
        modalTitle={modalTitle}
        modalContent={modalContent}
      />
    </Form>
  );
};
