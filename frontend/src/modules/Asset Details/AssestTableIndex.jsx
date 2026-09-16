import React, { Fragment, useState } from "react";
import { CustomSwitch } from "@components/form";
import AssetList from "./Partials/AssetList";
import MovableAssestList from "./MoveableAssest/Partials/MovableAssestList";

const AssestTableIndex = () => {
  const [selected, setSelected] = useState("");

  const handleSelect = (values) => {
    setSelected(values);
  };

  return (
    <Fragment>
      <div style={{ margin: "30px 0" }}>
        <CustomSwitch
          leftLabel={"Asset List"}
          rightLabel={"Movable Asset List"}
          onChange={handleSelect}
        />
      </div>

      {selected === true ? (
        <>
          <MovableAssestList />
        </>
      ) : (
        <>
          <AssetList />
        </>
      )}
    </Fragment>
  );
};

export default AssestTableIndex;
