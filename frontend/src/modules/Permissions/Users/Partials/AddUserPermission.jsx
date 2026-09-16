import { Checkbox, Col, Form } from "antd";
import React, { useEffect, useState } from "react";
import { StyledHeading } from "../style";
import { Button, CustomInput } from "@components/form";
import { CustomRow, Flex } from "@components/others";
import { toast } from "react-toastify";
import styled from "styled-components";
import { THEME } from "@theme/index";
import successHandler from "@request/successHandler";
import { getRole, selectRoleDetails } from "../UserSlice";
import { useDispatch, useSelector } from "react-redux";
import request from "@request/request";
import errorHandler from "@request/errorHandler";
import { APIURLS } from "@request/apiUrls/urls";

const StyledCheckbox = styled(Checkbox)`
  & .ant-checkbox .ant-checkbox-inner {
    /* width: 19px;
    height: 17px; */
    /* border-radius:50%; */
    /* border:2px solid ${THEME.primary}; */
    &:hover {
      background: ${THEME.primary};
    }
  }

  & .ant-checkbox-checked .ant-checkbox-inner {
    background-color: ${THEME.primary};
    border-color: ${THEME.primary};
  }

  & .ant-checkbox .ant-checkbox-inner:after {
    inset-inline-start: 25%;
    border: 2px solid black;
    border-left: 0;
    border-top: 0;
    top: 43%;
    width: 5.7142857142857135px;
    height: 11.142857px;
    border-width: 0px 3px 3px 0px;
  }

  .ant-checkbox .ant-checkbox-inner::after {
    inset-inline-start: 25%;
    border-right-color: white;
    border-bottom-color: white;
  }

  &.ant-checkbox-wrapper {
    align-items: center;
    height: 100%;
  }

  & .ant-checkbox-checked .ant-checkbox-inner {
    background-color: ${THEME.primary};
    border-color: ${THEME.primary};
  }

  .ant-checkbox + span {
    padding-left: 12px;
  }
  &.ant-checkbox-wrapper:not(.ant-checkbox-wrapper-disabled):hover
    .ant-checkbox-checked:not(.ant-checkbox-disabled)
    .ant-checkbox-inner {
    background-color: ${THEME.primary};
    border-color: transparent;
  }
`;

const StyledCheckboxGroup = styled(Checkbox.Group)`
  & .ant-checkbox .ant-checkbox-inner {
    width: 19px;
    height: 17px;
    border-radius: 50%;
    border: 2px solid ${THEME.primary};
    &:hover {
      background: ${THEME.primary};
    }
  }

  .ant-checkbox-group-item {
    .ant-checkbox-wrapper {
      .ant-checkbox {
        &.ant-checkbox-indeterminate .ant-checkbox-inner::after {
          border-color: transparent; // Remove border color
        }
      }
    }
  }

  & .ant-checkbox .ant-checkbox-inner:after {
    inset-inline-start: 25%;
    border: 2px solid black;
    border-left: 0;
    border-top: 0;
    top: 43%;
    width: 5.7142857142857135px;
    height: 11.142857px;
    border-width: 0px 3px 3px 0px;
  }

  .ant-checkbox .ant-checkbox-inner::after {
    inset-inline-start: 25%;
    border-right-color: white;
    border-bottom-color: white;
  }

  &.ant-checkbox-wrapper {
    align-items: center;
    height: 100%;
  }

  & .ant-checkbox-checked .ant-checkbox-inner {
    background-color: ${THEME.primary};
    border-color: ${THEME.primary};
  }

  .ant-checkbox + span {
    padding-left: 12px;
  }
  &.ant-checkbox-wrapper:not(.ant-checkbox-wrapper-disabled):hover
    .ant-checkbox-checked:not(.ant-checkbox-disabled)
    .ant-checkbox-inner {
    background-color: ${THEME.primary};
    border-color: transparent;
  }

  :where(.css-dev-only-do-not-override-2i2tap).ant-checkbox-indeterminate
    .ant-checkbox-inner:after {
    top: 50%;
    inset-inline-start: 50%;
    width: 8px;
    height: 8px;
    background-color: #9d0000;
    border: 0;
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    content: "";
  }
`;

const AddUserPermission = ({
  record,
  closeForm,
  trigger,
  CloseEditForm,
  handleOk,
  triggerr,
  FormClose,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const recordDetails = record?.role_link[0];

  useEffect(() => {
    dispatch(getRole());
  }, []);

  const roleGet = useSelector(selectRoleDetails);

  useEffect(() => {
    form.resetFields();
  }, [trigger]);

  useEffect(() => {
    if (record) {
      setPermissionDetails();
    }
  }, [record, trigger]);

  const setPermissionDetails = () => {
    // form.setFieldsValue(recordDetails)
    form.setFieldsValue(record);
  };

  const onReset = () => {
    form.resetFields();
    FormClose();
  };

  // Permissions

  const plainOptions = ["Add", "Edit", "Delete"];
  // DashBoard
  const [dashboard, setDashboard] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.dashboard === true) {
        setDashboard(true);
      }
    }
  }, [record, trigger]);

  // Balance Sheet View

  const [BalanceSheet, setBalanceSheet] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.balance_sheet_view === true) {
        setBalanceSheet(true);
      }
    }
  }, [record, trigger]);

  // -----  Family Options  ----------

  const [familycheckOptions, setFamilycheckOptions] = useState({});
  const [indeterminateFamily, setIndeterminateFamily] = useState(false);
  const [familycheckAll, setFamilyCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `fam_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setFamilycheckOptions(updatedOptions);
    }
  }, [trigger, recordDetails]);

  const famOptionsData = {
    family_values: plainOptions.reduce((acc, option) => {
      acc[`fam_${option.toLowerCase()}`] = familycheckOptions[option] || false;
      return acc;
    }, {}),
  };
  const FamilyonChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setFamilycheckOptions(updatedCheckedOptions);
    setIndeterminateFamily(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setFamilyCheckAll(checkedValues.length === plainOptions.length);
  };

  const FamilyonCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setFamilycheckOptions(updatedCheckedOptions);
    setIndeterminateFamily(false);
    setFamilyCheckAll(allChecked);
  };

  // Asset

  const [assetcheckOptions, setAssetcheckOptions] = useState({});
  const [indeterminateAsset, setIndeterminateAsset] = useState(false);
  const [assetcheckAll, setAssetCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `asset_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setAssetcheckOptions(updatedOptions);
    }
  }, [trigger, recordDetails]);

  const assetOptionsData = {
    asset_values: plainOptions.reduce((acc, option) => {
      acc[`asset_${option.toLowerCase()}`] = assetcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const AssetonChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setAssetcheckOptions(updatedCheckedOptions);
    setIndeterminateAsset(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setAssetCheckAll(checkedValues.length === plainOptions.length);
  };

  const AssetonCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setAssetcheckOptions(updatedCheckedOptions);
    setIndeterminateAsset(false);
    setAssetCheckAll(allChecked);
  };

  // Expense

  const [expensecheckOptions, setExpensecheckOptions] = useState({});
  const [indeterminateExpense, setIndeterminateExpense] = useState(false);
  const [expensecheckAll, setExpenseCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `expense_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setExpensecheckOptions(updatedOptions);
    }
  }, [trigger, recordDetails]);

  // const expenseOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`expense_${option.toLowerCase()}`] = expensecheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const expenseOptionsData = {
    expense_values: plainOptions.reduce((acc, option) => {
      acc[`expense_${option.toLowerCase()}`] =
        expensecheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const ExpenseonChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setExpensecheckOptions(updatedCheckedOptions);
    setIndeterminateExpense(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setExpenseCheckAll(checkedValues.length === plainOptions.length);
  };

  const ExpenseonCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setExpensecheckOptions(updatedCheckedOptions);
    setIndeterminateExpense(false);
    setExpenseCheckAll(allChecked);
  };

  // Collection

  const [collectioncheckOptions, setCollectioncheckOptions] = useState({});
  const [indeterminateCollection, setIndeterminateCollection] = useState(false);
  const [collectioncheckAll, setCollectionCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `collection_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setCollectioncheckOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const collectionOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`collection_${option.toLowerCase()}`] = collectioncheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const collectionOptionsData = {
    collection_values: plainOptions.reduce((acc, option) => {
      acc[`collection_${option.toLowerCase()}`] =
        collectioncheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const CollectiononChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setCollectioncheckOptions(updatedCheckedOptions);
    setIndeterminateCollection(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setCollectionCheckAll(checkedValues.length === plainOptions.length);
  };

  const CollectionCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setCollectioncheckOptions(updatedCheckedOptions);
    setIndeterminateCollection(false);
    setCollectionCheckAll(allChecked);
  };

  // Manage

  const [managecheckOptions, setManagecheckOptions] = useState({});
  const [indeterminateManage, setIndeterminateManage] = useState(false);
  const [managecheckAll, setManageCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `manage_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setManagecheckOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const manageOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`manage_${option.toLowerCase()}`] = managecheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const manageOptionsData = {
    manage_values: plainOptions.reduce((acc, option) => {
      acc[`manage_${option.toLowerCase()}`] =
        managecheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const ManageonChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setManagecheckOptions(updatedCheckedOptions);
    setIndeterminateManage(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setManageCheckAll(checkedValues.length === plainOptions.length);
  };

  const ManageCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setManagecheckOptions(updatedCheckedOptions);
    setIndeterminateManage(false);
    setManageCheckAll(allChecked);
  };

  // Fund

  const [fundcheckOptions, setFundcheckOptions] = useState({});
  const [indeterminateFund, setIndeterminateFund] = useState(false);
  const [fundcheckAll, setFundCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `fund_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setFundcheckOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const fundOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`fund_${option.toLowerCase()}`] = fundcheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const fundOptionsData = {
    fund_values: plainOptions.reduce((acc, option) => {
      acc[`fund_${option.toLowerCase()}`] = fundcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const FundonChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setFundcheckOptions(updatedCheckedOptions);
    setIndeterminateFund(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setFundCheckAll(checkedValues.length === plainOptions.length);
  };

  const FundCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setFundcheckOptions(updatedCheckedOptions);
    setIndeterminateFund(false);
    setFundCheckAll(allChecked);
  };

  // Chit - Fund

  const [chitfundcheckOptions, setChitFundcheckOptions] = useState({});
  const [indeterminateChitFund, setIndeterminateChitFund] = useState(false);
  const [chitfundcheckAll, setChitFundCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `chit_fund_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setChitFundcheckOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const chitfundOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`chit_fund_${option.toLowerCase()}`] = chitfundcheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const chitfundOptionsData = {
    chit_fund_values: plainOptions.reduce((acc, option) => {
      acc[`chit_fund_${option.toLowerCase()}`] =
        chitfundcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const chitFundonChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setChitFundcheckOptions(updatedCheckedOptions);
    setIndeterminateChitFund(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setChitFundCheckAll(checkedValues.length === plainOptions.length);
  };

  const ChitFundCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setChitFundcheckOptions(updatedCheckedOptions);
    setIndeterminateChitFund(false);
    setChitFundCheckAll(allChecked);
  };

  // Fund - Lease

  const [fundleasecheckOptions, setFundLeasecheckOptions] = useState({});
  const [indeterminateFundLease, setIndeterminateFundLease] = useState(false);
  const [fundleasecheckAll, setFundLeaseCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `fund_lease_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setFundLeasecheckOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const fundleaseOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`fund_lease_${option.toLowerCase()}`] = fundleasecheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const fundleaseOptionsData = {
    fund_lease_values: plainOptions.reduce((acc, option) => {
      acc[`fund_lease_${option.toLowerCase()}`] =
        fundleasecheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const FundLeaseOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setFundLeasecheckOptions(updatedCheckedOptions);
    setIndeterminateFundLease(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setFundLeaseCheckAll(checkedValues.length === plainOptions.length);
  };

  const FundLeaseCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setFundLeasecheckOptions(updatedCheckedOptions);
    setIndeterminateFundLease(false);
    setFundLeaseCheckAll(allChecked);
  };

  // Authority

  const [authoritycheckOptions, setauthoritycheckOptions] = useState({});
  const [indeterminateAuthority, setIndeterminateAuthority] = useState(false);
  const [authoritycheckAll, setAuthorityCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `authority_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setauthoritycheckOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const authorityOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`authority_${option.toLowerCase()}`] = authoritycheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const authorityOptionsData = {
    authority_values: plainOptions.reduce((acc, option) => {
      acc[`authority_${option.toLowerCase()}`] =
        authoritycheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const AuthorityOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setauthoritycheckOptions(updatedCheckedOptions);
    setIndeterminateAuthority(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setAuthorityCheckAll(checkedValues.length === plainOptions.length);
  };

  const AuthorityCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setauthoritycheckOptions(updatedCheckedOptions);
    setIndeterminateAuthority(false);
    setAuthorityCheckAll(allChecked);
  };

  // User

  const [usercheckOptions, setusercheckOptions] = useState({});
  const [indeterminateUser, setIndeterminateUser] = useState(false);
  const [usercheckAll, setUserCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `user_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setusercheckOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const userOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`user_${option.toLowerCase()}`] = usercheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const userOptionsData = {
    user_values: plainOptions.reduce((acc, option) => {
      acc[`user_${option.toLowerCase()}`] = usercheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const UserOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setusercheckOptions(updatedCheckedOptions);
    setIndeterminateUser(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setUserCheckAll(checkedValues.length === plainOptions.length);
  };

  const UserCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setusercheckOptions(updatedCheckedOptions);
    setIndeterminateUser(false);
    setUserCheckAll(allChecked);
  };

  // Death

  const [deathcheckOptions, setDeathOptions] = useState({});
  const [indeterminateDeath, setIndeterminateDeath] = useState(false);
  const [deathcheckAll, setDeathCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `death_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setDeathOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const deathOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`death_${option.toLowerCase()}`] = deathcheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const deathOptionsData = {
    death_values: plainOptions.reduce((acc, option) => {
      acc[`death_${option.toLowerCase()}`] = deathcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const DeathOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setDeathOptions(updatedCheckedOptions);
    setIndeterminateDeath(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setDeathCheckAll(checkedValues.length === plainOptions.length);
  };

  const DeathCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setDeathOptions(updatedCheckedOptions);
    setIndeterminateDeath(false);
    setDeathCheckAll(allChecked);
  };

  // Marriage

  const [marriagecheckOptions, setMarriageOptions] = useState({});
  const [indeterminateMarriage, setIndeterminateMarriage] = useState(false);
  const [marriagecheckAll, setMarriageCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `marriage_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setMarriageOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const marriageOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`marriage_${option.toLowerCase()}`] = marriagecheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const marriageOptionsData = {
    marriage_values: plainOptions.reduce((acc, option) => {
      acc[`marriage_${option.toLowerCase()}`] =
        marriagecheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const MarriageOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setMarriageOptions(updatedCheckedOptions);
    setIndeterminateMarriage(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setMarriageCheckAll(checkedValues.length === plainOptions.length);
  };

  const MarriageCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setMarriageOptions(updatedCheckedOptions);
    setIndeterminateMarriage(false);
    setMarriageCheckAll(allChecked);
  };

  // Income

  const [incomecheckOptions, setIncomeOptions] = useState({});
  const [indeterminateIncome, setIndeterminateIncome] = useState(false);
  const [incomecheckAll, setIncomeCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `income_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setIncomeOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const incomeOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`income_${option.toLowerCase()}`] = incomecheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const incomeOptionsData = {
    income_values: plainOptions.reduce((acc, option) => {
      acc[`income_${option.toLowerCase()}`] =
        incomecheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const IncomeOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setIncomeOptions(updatedCheckedOptions);
    setIndeterminateIncome(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setIncomeCheckAll(checkedValues.length === plainOptions.length);
  };

  const IncomeCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setIncomeOptions(updatedCheckedOptions);
    setIndeterminateIncome(false);
    setIncomeCheckAll(allChecked);
  };

  // Sangam

  const [sangamcheckOptions, setSangamOptions] = useState({});
  const [indeterminateSangam, setIndeterminateSangam] = useState(false);
  const [sangamcheckAll, setSangamCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `sangam_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setSangamOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const sangamOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`sangam_${option.toLowerCase()}`] = sangamcheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const sangamOptionsData = {
    sangam_values: plainOptions.reduce((acc, option) => {
      acc[`sangam_${option.toLowerCase()}`] =
        sangamcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const SangamOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setSangamOptions(updatedCheckedOptions);
    setIndeterminateSangam(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setSangamCheckAll(checkedValues.length === plainOptions.length);
  };

  const SangamCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setSangamOptions(updatedCheckedOptions);
    setIndeterminateSangam(false);
    setSangamCheckAll(allChecked);
  };

  // Rental

  const [rentalcheckOptions, setRentalOptions] = useState({});
  const [indeterminateRental, setIndeterminateRental] = useState(false);
  const [rentalcheckAll, setRentalCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `rental_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setRentalOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const rentalOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`rental_${option.toLowerCase()}`] = rentalcheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const rentalOptionsData = {
    rental_values: plainOptions.reduce((acc, option) => {
      acc[`rental_${option.toLowerCase()}`] =
        rentalcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const RentalOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setRentalOptions(updatedCheckedOptions);
    setIndeterminateRental(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setRentalCheckAll(checkedValues.length === plainOptions.length);
  };

  const RentalCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setRentalOptions(updatedCheckedOptions);
    setIndeterminateRental(false);
    setRentalCheckAll(allChecked);
  };

  // Festival

  const [festivalcheckOptions, setFestivalOptions] = useState({});
  const [indeterminateFestival, setIndeterminateFestival] = useState(false);
  const [festivalcheckAll, setFestivalCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `festival_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setFestivalOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const festivalOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`festival_${option.toLowerCase()}`] = festivalcheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const festivalOptionsData = {
    festival_value: plainOptions.reduce((acc, option) => {
      acc[`festival_${option.toLowerCase()}`] =
        festivalcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const FestivalOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setFestivalOptions(updatedCheckedOptions);
    setIndeterminateFestival(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setFestivalCheckAll(checkedValues.length === plainOptions.length);
  };

  const FestivalCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setFestivalOptions(updatedCheckedOptions);
    setIndeterminateFestival(false);
    setFestivalCheckAll(allChecked);
  };

  // Sub - Tarif

  const [subtarifcheckOptions, setSubTarifOptions] = useState({});
  const [indeterminateSubTarif, setIndeterminateSubTarif] = useState(false);
  const [subtarifcheckAll, setSubTarifCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `sub_tarif_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setSubTarifOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const subtarifOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`sub_tarif_${option.toLowerCase()}`] = subtarifcheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const subtarifOptionsData = {
    subtariff_values: plainOptions.reduce((acc, option) => {
      acc[`sub_tarif_${option.toLowerCase()}`] =
        subtarifcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const SubTarifOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setSubTarifOptions(updatedCheckedOptions);
    setIndeterminateSubTarif(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setSubTarifCheckAll(checkedValues.length === plainOptions.length);
  };

  const SubTarifCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setSubTarifOptions(updatedCheckedOptions);
    setIndeterminateSubTarif(false);
    setSubTarifCheckAll(allChecked);
  };

  // Tax

  const [taxcheckOptions, setTaxOptions] = useState({});
  const [indeterminateTax, setIndeterminateTax] = useState(false);
  const [taxcheckAll, setTaxCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `tax_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setTaxOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const taxOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`tax_${option.toLowerCase()}`] = taxcheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const taxOptionsData = {
    tax_values: plainOptions.reduce((acc, option) => {
      acc[`tax_${option.toLowerCase()}`] = taxcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const TaxOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setTaxOptions(updatedCheckedOptions);
    setIndeterminateTax(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setTaxCheckAll(checkedValues.length === plainOptions.length);
  };

  const TaxCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setTaxOptions(updatedCheckedOptions);
    setIndeterminateTax(false);
    setTaxCheckAll(allChecked);
  };

  // Interest

  const [interestcheckOptions, setInterestOptions] = useState({});
  const [indeterminateInterest, setIndeterminateInterest] = useState(false);
  const [interestcheckAll, setInterestCheckAll] = useState(false);

  useEffect(() => {
    if (recordDetails) {
      const updatedOptions = {};
      plainOptions.forEach((option) => {
        const key = `interest_${option.toLowerCase()}`;
        updatedOptions[option] = recordDetails[key] === true;
      });
      setInterestOptions(updatedOptions);
    }
  }, [recordDetails, trigger]);

  // const interestOptionsData = {
  //     ...plainOptions.reduce((acc, option) => {
  //         acc[`interest_${option.toLowerCase()}`] = interestcheckOptions[option] || false;
  //         return acc;
  //     }, {})
  // };

  const interestOptionsData = {
    interest_values: plainOptions.reduce((acc, option) => {
      acc[`interest_${option.toLowerCase()}`] =
        interestcheckOptions[option] || false;
      return acc;
    }, {}),
  };

  const InterestOnChange = (checkedValues) => {
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = checkedValues.includes(option);
    });

    if (checkedValues.includes("Edit", "Add")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["View"] = true;
    } else if (checkedValues.includes("Delete")) {
      updatedCheckedOptions["Add"] = true;
      updatedCheckedOptions["Edit"] = true;
      updatedCheckedOptions["View"] = true;
    }

    setInterestOptions(updatedCheckedOptions);
    setIndeterminateInterest(
      !!checkedValues.length && checkedValues.length < plainOptions.length
    );
    setInterestCheckAll(checkedValues.length === plainOptions.length);
  };

  const InterestCheckAllChange = (e) => {
    const allChecked = e.target.checked;
    const updatedCheckedOptions = {};
    plainOptions.forEach((option) => {
      updatedCheckedOptions[option] = allChecked;
    });

    setInterestOptions(updatedCheckedOptions);
    setIndeterminateInterest(false);
    setInterestCheckAll(allChecked);
  };

  // Collection - Fund

  const [isFunded, setIsFunded] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.fund === true) {
        setIsFunded(true);
      }
    }
  }, [record]);

  const handleFundCheckboxChange = (e) => {
    setIsFunded(e.target.checked ? true : false);
  };

  // Collection - Festival

  const [isFestival, setIsFestival] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.festival === true) {
        setIsFestival(true);
      }
    }
  }, [record]);
    // Collection - Marriage

    const [marriageDrop, setMarriageDrop] = useState(false);

    useEffect(() => {
      if (record && record.role_link && record.role_link.length > 0) {
        const recordDetails = record.role_link[0];
        if (recordDetails.marriage === true) {
          setMarriageDrop(true);
        }
      }
    }, [record]);

  const handleFestivalCheckboxChange = (e) => {
    setIsFestival(e.target.checked ? true : false);
  };
  const handlemarriageCheckboxChange = (e) => {
    setMarriageDrop(e.target.checked ? true : false);
  };
  // Collection - Tax

  const [isTax, setIsTax] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.tax === true) {
        setIsTax(true);
      }
    }
  }, [record]);

  const handleTaxCheckboxChange = (e) => {
    setIsTax(e.target.checked ? true : false);
  };

  // Collection - Rent

  const [isRent, setIsRent] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.rent === true) {
        setIsRent(true);
      }
    }
  }, [record]);

  const handleRentCheckboxChange = (e) => {
    setIsRent(e.target.checked ? true : false);
  };

  // Collection - Lease

  const [isLease, setIsLease] = useState(false);
  const [moveableRent, setMoveableRent] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.lease === true) {
        setIsLease(true);
      }
    }
  }, [record]);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.moveable_asset_rent === true) {
        setMoveableRent(true);
      }
    }
  }, [record]);

  const handleLeaseCheckboxChange = (e) => {
    setIsLease(e.target.checked ? true : false);
  };

  const handleMoveableAssetRentChange = (e) => {
    setMoveableRent(e.target.checked ? true : false);
  };

  // Collection - Management Interest

  const [isManagementInterest, setIsManagementInterest] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.management_interest === true) {
        setIsManagementInterest(true);
      }
    }
  }, [record]);

  const handleManagementInterest = (e) => {
    setIsManagementInterest(e.target.checked ? true : false);
  };

  // Collection - Chit - Interest

  const [chitInterest, setIsChitInterest] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.chit_interest === true) {
        setIsChitInterest(true);
      }
    }
  }, [record]);

  const handleChitInterest = (e) => {
    setIsChitInterest(e.target.checked ? true : false);
  };

  // Collection - Sub - Tariff

  const [subTariff, setIsSubTariff] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.sub_tariff === true) {
        setIsSubTariff(true);
      }
    }
  }, [record]);

  const handleSubTariff = (e) => {
    setIsSubTariff(e.target.checked ? true : false);
  };

  // Collection - Balance

  const [balance, setIsBalance] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.balance === true) {
        setIsBalance(true);
      }
    }
  }, [record]);

  const handleBalance = (e) => {
    setIsBalance(e.target.checked ? true : false);
  };

  // Death - Tariff

  const [deathTariff, setDeathTariff] = useState(false);

  useEffect(() => {
    if (record && record.role_link && record.role_link.length > 0) {
      const recordDetails = record.role_link[0];
      if (recordDetails.death_tariff === true) {
        setDeathTariff(true);
      }
    }
  }, [record]);

  const hanfleDeathTariff = (e) => {
    setDeathTariff(e.target.checked ? true : false);
  };

  const onFinish = (values) => {
    const familyArray = Object.keys(familycheckOptions).filter(
      (option) => familycheckOptions[option]
    );
    const assestArray = Object.keys(assetcheckOptions).filter(
      (option) => assetcheckOptions[option]
    );
    const expenseOptionArray = Object.keys(expensecheckOptions).filter(
      (option) => assetcheckOptions[option]
    );
    const collectionArray = Object.keys(collectioncheckOptions).filter(
      (option) => collectioncheckOptions[option]
    );
    const manageArray = Object.keys(managecheckOptions).filter(
      (option) => managecheckOptions[option]
    );
    const fundArray = Object.keys(fundcheckOptions).filter(
      (option) => fundcheckOptions[option]
    );
    const chitFundArray = Object.keys(chitfundcheckOptions).filter(
      (option) => chitfundcheckOptions[option]
    );
    const fundLeaseArray = Object.keys(fundleasecheckOptions).filter(
      (option) => fundleasecheckOptions[option]
    );
    const authorityArray = Object.keys(authoritycheckOptions).filter(
      (option) => authoritycheckOptions[option]
    );
    const userArray = Object.keys(usercheckOptions).filter(
      (option) => usercheckOptions[option]
    );
    const deathArray = Object.keys(deathcheckOptions).filter(
      (option) => deathcheckOptions[option]
    );
    const marriageArray = Object.keys(marriagecheckOptions).filter(
      (option) => marriagecheckOptions[option]
    );
    const incomeArray = Object.keys(incomecheckOptions).filter(
      (option) => incomecheckOptions[option]
    );
    const sangamArray = Object.keys(sangamcheckOptions).filter(
      (option) => sangamcheckOptions[option]
    );
    const rentalArray = Object.keys(rentalcheckOptions).filter(
      (option) => rentalcheckOptions[option]
    );
    const festivalArray = Object.keys(festivalcheckOptions).filter(
      (option) => festivalcheckOptions[option]
    );
    const subtarifArray = Object.keys(subtarifcheckOptions).filter(
      (option) => subtarifcheckOptions[option]
    );
    const taxArray = Object.keys(taxcheckOptions).filter(
      (option) => taxcheckOptions[option]
    );
    const interestArray = Object.keys(interestcheckOptions).filter(
      (option) => interestcheckOptions[option]
    );

    const RecordValues = {
      ...values,
      family_values: plainOptions.map((option) => ({
        [option]: familyArray.includes(option),
      })),
      asset_values: plainOptions.map((option) => ({
        [option]: assestArray.includes(option),
      })),
      expense_values: plainOptions.map((option) => ({
        [option]: expenseOptionArray.includes(option),
      })),
      collection_values: plainOptions.map((option) => ({
        [option]: collectionArray.includes(option),
      })),
      manage_values: plainOptions.map((option) => ({
        [option]: manageArray.includes(option),
      })),
      fund_values: plainOptions.map((option) => ({
        [option]: fundArray.includes(option),
      })),
      chit_fund_values: plainOptions.map((option) => ({
        [option]: chitFundArray.includes(option),
      })),
      fund_lease_values: plainOptions.map((option) => ({
        [option]: fundLeaseArray.includes(option),
      })),
      authority_values: plainOptions.map((option) => ({
        [option]: authorityArray.includes(option),
      })),
      user_values: plainOptions.map((option) => ({
        [option]: userArray.includes(option),
      })),
      death_values: plainOptions.map((option) => ({
        [option]: deathArray.includes(option),
      })),
      marriage_values: plainOptions.map((option) => ({
        [option]: marriageArray.includes(option),
      })),
      income_values: plainOptions.map((option) => ({
        [option]: incomeArray.includes(option),
      })),
      sangam_values: plainOptions.map((option) => ({
        [option]: sangamArray.includes(option),
      })),
      rental_values: plainOptions.map((option) => ({
        [option]: rentalArray.includes(option),
      })),
      festival_value: plainOptions.map((option) => ({
        [option]: festivalArray.includes(option),
      })),
      subtariff_values: plainOptions.map((option) => ({
        [option]: subtarifArray.includes(option),
      })),
      tax_values: plainOptions.map((option) => ({
        [option]: taxArray.includes(option),
      })),
      interest_values: plainOptions.map((option) => ({
        [option]: interestArray.includes(option),
      })),
    };

    let finaldata = {
      Role_name: RecordValues?.Role_name,
      family_values: RecordValues?.family_values,
      asset_values: RecordValues?.asset_values,
      expense_values: RecordValues?.expense_values,
      // collection_values: RecordValues?.collection_values,
      // manage_values: RecordValues?.manage_values,
      fund_values: RecordValues?.fund_values,
      chit_fund_values: RecordValues?.chit_fund_values,
      // fund_lease_values: RecordValues?.fund_lease_values,
      authority_values: RecordValues?.authority_values,
      // user_values: RecordValues?.user_values,
      death_values: RecordValues?.death_values,
      marriage_values: RecordValues?.marriage_values,
      income_values: RecordValues?.income_values,
      sangam_values: RecordValues?.sangam_values,
      rental_values: RecordValues?.rental_values,
      festival_value: RecordValues?.festival_value,
      subtariff_values: RecordValues?.subtariff_values,
      // tax_values: RecordValues?.tax_values,
      interest_values: RecordValues?.interest_values,
      dashboard: dashboard || false,
      balance_sheet_view: BalanceSheet || false,
      fund: isFunded || false,
      festival: isFestival || false,
      marriage: marriageDrop || false,
      // tax: isTax || false,
      rent: isRent || false,
      lease: isLease || false,
      moveable_asset_rent:moveableRent || false,
      management_interest: isManagementInterest || false,
      chit_interest: chitInterest || false,
      sub_tariff: subTariff || false,
      balance: balance || false,
      death_tariff: deathTariff || false,

      ...famOptionsData,
      ...assetOptionsData,
      ...expenseOptionsData,
      // ...collectionOptionsData,
      // ...manageOptionsData,
      ...fundOptionsData,
      ...chitfundOptionsData,
      // ...fundleaseOptionsData,
      ...authorityOptionsData,
      // ...userOptionsData,
      ...deathOptionsData,
      ...marriageOptionsData,
      ...incomeOptionsData,
      ...sangamOptionsData,
      ...rentalOptionsData,
      ...festivalOptionsData,
      ...subtarifOptionsData,
      // ...taxOptionsData,
      ...interestOptionsData,
    };

    if (record) {
      UpdateRole(finaldata);
    } else {
      PostRole(finaldata);
    }
    // console.log(finaldata,'finaldata');
  };

  const PostRole = async (data) => {
    await request
      .post(`${APIURLS.CREATEUSER_ROLE_POST}`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Role Added Successfully ! ",
          type: "success",
        });
        dispatch(getRole());
        if (FormClose) {
          FormClose();
        }
        return response.data;
      })
      .catch(function (error) {
        if(error.response.status === 406){
          toast.error(error.response.data.message);
        }
        else{
          return errorHandler(error);
        }
      });
  };

  const UpdateRole = async (data) => {
    await request
      .put(`${APIURLS.PUT_ROLE_PERMISSION}${record?.id}/`, data)
      .then(function (response) {
        successHandler(response, {
          notifyOnSuccess: true,
          notifyOnFailed: true,
          msg: "Role Updated Successfully ! ",
          type: "info",
        });
        dispatch(getRole());
        if (CloseEditForm) {
          CloseEditForm();
        }
        return response.data;
      })
      .catch(function (error) {
        return errorHandler(error);
      });
  };

  const onFinishFailed = (values) => {
    toast.warn("Please fill in all the required details !");
  };
  return (
    <Form
      name="AddUserRolePermission"
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
            label={"Role Name"}
            name={"Role_name"}
            rules={[
              {
                required: true,
                message: "Please Enter Role Name !",
              },
            ]}
          />
        </Col>
        <Col span={24} md={24}>
          <StyledHeading>
            <h3>Permission</h3>
          </StyledHeading>
        </Col>

        {/* // DashBoard // */}

        <Col span={24} md={24}>
          <Flex spaceevenly>
            {/* <Checkbox
                            name={'dashboard'}
                            checked={dashboard}
                            onChange={dashboardOnChange}
                        >
                            <p>DashBoard</p>
                        </Checkbox> */}
            <Checkbox
                            name={'management_interest'}
                            checked={isManagementInterest}
                            onChange={handleManagementInterest}
                        >
                            <p>Management Interest</p>
                        </Checkbox>
            {/* <Checkbox
                            name={'balance_sheet_view'}
                            checked={BalanceSheet}
                            onChange={balanceSheetOnChange}
                        >
                            <p>Balance Sheet View</p>
                        </Checkbox> */}
          </Flex>
        </Col>

        {/* // Family // */}

        <Col span={24} md={24}>
          <Checkbox
            indeterminate={indeterminateFamily}
            onChange={FamilyonCheckAllChange}
            checked={familycheckAll}
          >
            <h3>Family</h3>
          </Checkbox>
          <br />
          <Checkbox.Group
            style={{ display: "flex", justifyContent: "space-evenly" }}
            options={plainOptions}
            value={Object.keys(familycheckOptions).filter(
              (option) => familycheckOptions[option]
            )}
            onChange={FamilyonChange}
          />
        </Col>

        {/* // Asset // */}

        <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateAsset} onChange={AssetonCheckAllChange} checked={assetcheckAll}>
                        <h3>Asset</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(assetcheckOptions).filter(option => assetcheckOptions[option])} onChange={AssetonChange} />
                </Col>
        {/* // Collection // */}
        {/* <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateCollection} onChange={CollectionCheckAllChange} checked={collectioncheckAll}>
                        <h3>Collection</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(collectioncheckOptions).filter(option => collectioncheckOptions[option])} onChange={CollectiononChange} />
                </Col>  */}
        {/* // Manage // */}
        {/* <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateManage} onChange={ManageCheckAllChange} checked={managecheckAll}>
                        <h3>Manage</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(managecheckOptions).filter(option => managecheckOptions[option])} onChange={ManageonChange} />
                </Col> */}

        {/* // Fund // */}

        
                <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateFund} onChange={FundCheckAllChange} checked={fundcheckAll}>
                        <h3>Fund</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(fundcheckOptions).filter(option => fundcheckOptions[option])} onChange={FundonChange} />
                </Col>

        {/* // Chit - Fund // */}
        
                <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateChitFund} onChange={ChitFundCheckAllChange} checked={chitfundcheckAll}>
                        <h3>Chit - Fund</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(chitfundcheckOptions).filter(option => chitfundcheckOptions[option])} onChange={chitFundonChange} />
                </Col>

        {/* // Fund - Lease // */}

        {/* <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateFundLease} onChange={FundLeaseCheckAllChange} checked={fundleasecheckAll}>
                        <h3>Fund - Lease</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(fundleasecheckOptions).filter(option => fundleasecheckOptions[option])} onChange={FundLeaseOnChange} />
                </Col> */}

        {/* // Authority  // */}

        <Col span={24} md={24}>
          <Checkbox
            indeterminate={indeterminateAuthority}
            onChange={AuthorityCheckAllChange}
            checked={authoritycheckAll}
          >
            <h3>Authority</h3>
          </Checkbox>
          <br />
          <Checkbox.Group
            style={{ display: "flex", justifyContent: "space-evenly" }}
            options={plainOptions}
            value={Object.keys(authoritycheckOptions).filter(
              (option) => authoritycheckOptions[option]
            )}
            onChange={AuthorityOnChange}
          />
        </Col>
        {/* // User // */}
        {/* <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateUser} onChange={UserCheckAllChange} checked={usercheckAll}>
                        <h3>User</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} 
                    value={Object.keys(usercheckOptions).filter(option => usercheckOptions[option])} onChange={UserOnChange} />
                </Col> */}

        {/* // Death // */}
        <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateDeath} onChange={DeathCheckAllChange} checked={deathcheckAll}>
                        <h3>Death</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} 
                    value={Object.keys(deathcheckOptions).filter(option => deathcheckOptions[option])} onChange={DeathOnChange} />
                </Col>

        {/* // Marriage // */}
        <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateMarriage} onChange={MarriageCheckAllChange} checked={marriagecheckAll}>
                        <h3>Marriage</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} 
                    value={Object.keys(marriagecheckOptions).filter(option => marriagecheckOptions[option])} 
                    onChange={MarriageOnChange} />
                </Col>

        {/* // Income // */}

        <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateIncome} onChange={IncomeCheckAllChange} checked={incomecheckAll}>
                        <h3>Income</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} 
                    value={Object.keys(incomecheckOptions).filter(option => incomecheckOptions[option])} 
                    onChange={IncomeOnChange} />
                </Col>
                
        {/* // Expense //  */}

     <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateExpense} onChange={ExpenseonCheckAllChange} checked={expensecheckAll}>
                        <h3>Expense</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions}
                     value={Object.keys(expensecheckOptions).filter(option => expensecheckOptions[option])}
                      onChange={ExpenseonChange} />
                </Col> 

        {/* // Sangam // */}

        <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateSangam} onChange={SangamCheckAllChange} checked={sangamcheckAll}>
                        <h3>Sangam</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(sangamcheckOptions).filter(option => sangamcheckOptions[option])} onChange={SangamOnChange} />
                </Col>

        {/* // Rental // */}

        <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateRental} onChange={RentalCheckAllChange} checked={rentalcheckAll}>
                        <h3>Rental</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(rentalcheckOptions).filter(option => rentalcheckOptions[option])} onChange={RentalOnChange} />
                </Col>

        {/* // Festival // */}
        <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateFestival} onChange={FestivalCheckAllChange} checked={festivalcheckAll}>
                        <h3>Festival</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(festivalcheckOptions).filter(option => festivalcheckOptions[option])} onChange={FestivalOnChange} />
                </Col>

        {/* // Sub - Tarif // */}

        <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateSubTarif} onChange={SubTarifCheckAllChange} checked={subtarifcheckAll}>
                        <h3>Sub - Tarif</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(subtarifcheckOptions).filter(option => subtarifcheckOptions[option])} onChange={SubTarifOnChange} />
                </Col>

        {/* // Tax // */}
        {/* <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateTax} onChange={TaxCheckAllChange} checked={taxcheckAll}>
                        <h3>Tax</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions} value={Object.keys(taxcheckOptions).filter(option => taxcheckOptions[option])} onChange={TaxOnChange} />
                </Col> */}

        {/* // Interest // */}
        <Col span={24} md={24}>
                    <Checkbox indeterminate={indeterminateInterest} onChange={InterestCheckAllChange} checked={interestcheckAll}>
                        <h3>Interest</h3>
                    </Checkbox><br />
                    <Checkbox.Group style={{ display: 'flex', justifyContent: 'space-evenly' }} options={plainOptions}
                     value={Object.keys(interestcheckOptions).filter(option => interestcheckOptions[option])}
                      onChange={InterestOnChange} />
                </Col>
        <Col span={24} md={24}>
                    <StyledHeading>
                        <h3>Collection</h3>
                    </StyledHeading>
                </Col>
                <Col span={24} md={24}>
                    <Flex spaceevenly>
                        <Checkbox
                            name={'fund'}
                            checked={isFunded}
                            onChange={handleFundCheckboxChange}
                        >
                            <p>Fund</p>
                        </Checkbox>
                        <Checkbox
                            name={'festival'}
                            checked={isFestival}
                            onChange={handleFestivalCheckboxChange}
                        >
                            <p>Festival</p>
                        </Checkbox>
                        <Checkbox
                            name={'marriage'}
                            checked={marriageDrop}
                            onChange={handlemarriageCheckboxChange}
                        >
                            <p>Marriage</p>
                        </Checkbox>
                        {/* <Checkbox
                            name={'tax'}
                            checked={isTax}
                            onChange={handleTaxCheckboxChange}
                        >
                            <p>Tax</p>
                        </Checkbox> */}
                        <Checkbox
                            name={'rent'}
                            checked={isRent}
                            onChange={handleRentCheckboxChange}
                        >
                            <p>Rent</p>
                        </Checkbox>
                    </Flex>
                </Col>
                <Col span={24} md={24}>
                    <Flex spaceevenly>
                        <Checkbox
                            name={'lease'}
                            checked={isLease}
                            onChange={handleLeaseCheckboxChange}
                        >
                            <p>Lease</p>
                        </Checkbox>
                        <Checkbox
                            name={'moveable_asset_rent'}
                            checked={moveableRent}
                            onChange={handleMoveableAssetRentChange}
                        >
                            <p>Moveable Asset Rent</p>
                        </Checkbox>
                        <Checkbox
                            name={'chit_interest'}
                            checked={chitInterest}
                            onChange={handleChitInterest}
                        >
                            <p>Chit - Interest</p>
                        </Checkbox>
                    </Flex>
                </Col>
                <Col span={24} md={24}>
                    <Flex spaceevenly>
                        <Checkbox
                            name={'sub_tariff'}
                            checked={subTariff}
                            onChange={handleSubTariff}
                        >
                            <p>Sub - Tariff</p>
                        </Checkbox>

                        <Checkbox
                            name={'balance'}
                            checked={balance}
                            onChange={handleBalance}
                        >
                            <p>Balance</p>
                        </Checkbox>
                        <Checkbox
                            name={'death_tariff'}
                            checked={deathTariff}
                            onChange={hanfleDeathTariff}
                        >
                            <p>Death - Tariff</p>
                        </Checkbox>
                    </Flex>

                </Col>
      </CustomRow>
      <Flex center={true} margin={"30px 0px"}>
        {record ? (
          <Flex center={true} margin={"30px 0px"}>
            <Button.Primary text={"Update"} htmlType="submit" />
            <Button.Secondary text={"Close"} onClick={() => CloseEditForm()} />
          </Flex>
        ) : (
          <Flex center={true} margin={"30px 0px"}>
            <Button.Primary text={"Submit"} htmlType="submit" />
            <Button.Secondary text={"Cancel"} onClick={() => onReset()} />
          </Flex>
        )}
      </Flex>
    </Form>
  );
};

export default AddUserPermission;
