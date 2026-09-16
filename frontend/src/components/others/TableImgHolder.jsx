import React from 'react';
import styled from 'styled-components';

const ImageContainer = styled.div`
  width:100px; 
  height: 70px; 
  overflow: hidden; 
  border-radius: 6px;
  border: ${({ imageUrl }) => (imageUrl ? 'none' : '1px solid blue')};
  /* border: 1px solid red; */
  position:relative;
`;

const ImageStyled = styled.img`
  width: 100%;
  height:100%;
  position:absolute;
  object-fit: contain;
`;

const TableImgHolder = ({ imageUrl }) => {
    return (
      <ImageContainer imageUrl={imageUrl}>
      {imageUrl && <ImageStyled src={imageUrl} alt="Image" />}
    </ImageContainer>
    );
};

export default TableImgHolder
