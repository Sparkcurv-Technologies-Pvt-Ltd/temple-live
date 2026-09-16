import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { CustomRow, Flex } from '@components/others';
import { Col } from 'antd';

const PerStyle = styled(Col)`
  .personstyle {
    border: 1px solid black;
    padding: 20px;
    margin: 10px;
    background-color: #b1a6a6;
  }
`;

export const Drag = () => {
  const [people, setPeople] = useState([
    { id: 1, name: 'jeff' },
    { id: 2, name: 'alice' },
    { id: 3, name: 'bob' },
  ]);

  const [peoples, setPeoples] = useState([
    { id: 1, name: 'Ash' },
    { id: 2, name: 'Mesh' },
    { id: 3, name: 'Jesh' },
  ]);




  const dragPerson = useRef(null);
  const draggedOverPerson = useRef(null);

  const handleSort = () => {
    if (dragPerson.current !== null && draggedOverPerson.current !== null) {
      const peopleClone = [...people];
      const temp = peopleClone[dragPerson.current];
      peopleClone[dragPerson.current] = peopleClone[draggedOverPerson.current];
      peopleClone[draggedOverPerson.current] = temp;
      setPeople(peopleClone);
      setPeoples(peopleClone)

      
    }
  };

  return (
    <>
      <CustomRow space={[12, 12]}>
        <Col span={24} md={24}>
          <Flex center>
            <p>LIST</p>
          </Flex>
        </Col>

        <br />
        <PerStyle span={8} md={8}>
          {people.map((person, index) => (
            <div
              key={person.id}
              draggable
              className="personstyle"
              onDragStart={() => (dragPerson.current = index)}
              onDragEnter={() => (draggedOverPerson.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
            >
              <p>{person.name}</p>
            </div>
          ))}
        </PerStyle>
        <PerStyle span={8} md={8}>
          {peoples.map((person, index) => (
            <div
            
              draggable
              className="personstyle"
              onDragStart={() => (dragPerson.current = index)}
              onDragEnter={() => (draggedOverPerson.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
            >
              <p>{person.name}</p>
            </div>
          ))}
        </PerStyle>
       
      </CustomRow>
    </>
  );
};
