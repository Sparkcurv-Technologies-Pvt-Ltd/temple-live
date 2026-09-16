import styled from "styled-components";

const CustomCard = styled.div`
    background: #fff;
    margin:auto;
    max-width:${props => props.width || '100%'};
    padding:25px;
    border-radius:10px;
`

const CustomCardView = ({ children, width }) => {
    
    return (
        <CustomCard width={width}>
            {children}
        </CustomCard>
    )
}

export default CustomCardView