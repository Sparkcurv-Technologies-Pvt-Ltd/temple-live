import React, { useState } from 'react';
import { Checkbox } from 'antd';

const CheckboxGroup = Checkbox.Group;

const CheckboxGroupWithCheckAll = ({ options, onChange }) => {
  const [checkedList, setCheckedList] = useState([]);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);

  const onInternalChange = (list) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < options.length);
    setCheckAll(list.length === options.length);

    if (onChange) {
      onChange(list);
    }
  };

  const onCheckAllChange = (e) => {
    const newCheckedList = e.target.checked ? options : [];
    onInternalChange(newCheckedList);
  };

  return (
    <div>
      <div style={{ borderBottom: '1px solid #E9E9E9' }}>
        <Checkbox
          indeterminate={indeterminate}
          onChange={onCheckAllChange}
          checked={checkAll}
        >
          Check all
        </Checkbox>
      </div>
      <br />
      <CheckboxGroup options={options} value={checkedList} onChange={onInternalChange} />
    </div>
  );
};

export default CheckboxGroupWithCheckAll;