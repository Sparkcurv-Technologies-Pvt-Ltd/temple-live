import React, { useEffect } from "react";
import { Button, CustomInput } from "@components/form";
import { CustomRow, Flex } from "@components/others";
import { Col, Form } from "antd";

import { APIURLS } from "@request/apiUrls/urls";
import request from "@request/request";
import errorHandler from "@request/errorHandler";
import successHandler from "@request/successHandler";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  getAssetCategory,
  getMovableAssetCategory,
} from "@modules/Asset Details/AssetSlice";

export const MovableAssestModal = ({ updateRecord, propertytrigger, handleClose, FormUpdate, UpdateTrigger }) => {

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    form.setFieldsValue({ id: updateRecord?.id, categoryname: updateRecord?.categoryname })
  }, [updateRecord, propertytrigger, UpdateTrigger]);

  useEffect(() => {
    dispatch(getMovableAssetCategory());
  }, []);

  const onFinish = (data) => {
    if (updateRecord) {
      MovableAssetUpdateCategory(data)
    } else {
      MovableModalAssetCategory(data);
    }

  };

  const onFinishFailed = (errorInfo) => {
    toast.warn("Please fill in all the required details !");
  };

  const MovableModalAssetCategory = async (data) => {
    await request
      .post(`${APIURLS.POST_MOVABLE_ASSET_CATEGORY_MODAL}`, data)
      .then(function (response) {
        if (response.status === 226) {
          toast.warn(response.data.message)
        }
        else {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "Movable Asset Category Added Successfully",
            type: "success",
          });
          handleClose();
          form.resetFields();
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 400) {
          toast.warn(error.response.data?.categoryname?.[0]);
        } else {
          return errorHandler(error);
        }
      });
  };

  const MovableAssetUpdateCategory = async (data) => {
    await request.put(`${APIURLS.EDIT_MOVABLE_ASSET_CATEGORY}/${updateRecord?.id}/`, data)
      .then(function (response) {
        if (response.status === 226) {
          toast.warn(response.data.message)
        }
        else {
          successHandler(response, {
            notifyOnSuccess: true,
            notifyOnFailed: true,
            msg: "Movable Asset Category Updated Successfully",
            type: "success",
          });
          form.resetFields();
          FormUpdate();
        }
        return response.data;
      })
      .catch(function (error) {
        if (error.response.status === 400) {
          toast.warn(error.response.data?.categoryname?.[0])
        } else {
          return errorHandler(error);

        }
      });
  };

  return (
    <Form
      name="AddMovableModal"
      form={form}
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
      <CustomRow space={[24, 24]}>
        <Col span={24} md={24}>
          <CustomInput
            label={"Movable Asset Category"}
            name={"categoryname"}
            rules={[
              {
                required: true,
                message: "Please Enter a Asset Category Name !",
              },
            ]}
          />
        </Col>
      </CustomRow>
      {updateRecord ? <Flex center gap={"20px"} style={{ margin: "30px" }}>
        <Button.Danger text={"Update"} htmlType={"submit"} />
        <Button.Success text={"Cancel"} onClick={() => FormUpdate()} />
      </Flex> :
        <Flex center gap={"20px"} style={{ margin: "30px" }}>
          <Button.Danger text={"Add"} htmlType={"submit"} />
          <Button.Success text={"Cancel"} onClick={() => handleClose()} />
        </Flex>
      }
    </Form>
  );
};
