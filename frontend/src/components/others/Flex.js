import styled, { css } from 'styled-components'

const defaultStyles = ({
    center,
    right,
    centervertically,
    flexend,
    spacebetween,
    spacearound,
    spaceevenly,
    column,
    cursor,
    wrap,
    aligncenter,
    end,
    flexstart,
    baseline,
    flexflow,
    alignend,
    H_100,
    W_100,
    gap,
    margin,
    maxWidthEnter,
}) =>

    css`
    display: flex;
    ${H_100 && 'height:100%;'}
    ${W_100 && 'width:100%;'}
    ${gap && `gap:${gap};`}
    ${margin && `margin:${margin};`}
    ${center && 'justify-content: center;'}
    ${right && 'justify-content: flex-end;'}
    ${spacebetween && 'justify-content: space-between;'}
    ${spacearound && 'justify-content: space-around;'}
    ${spaceevenly && 'justify-content: space-evenly;'}
    ${flexend && 'justify-content: flex-end;'}
    ${centervertically && 'align-items: center;'}
    ${column && 'flex-direction: column;'}
    ${cursor && 'cursor: pointer;'}
    ${wrap && 'flex-wrap: wrap;'}
    ${aligncenter && 'align-items: center;'}
    ${end && 'justify-content: end;'}
    ${flexstart && 'align-items: flex-start;'}
    ${baseline && 'align-items: baseline;'}
    ${flexflow && 'flex-flow: wrap;'}
    ${alignend && 'align-items: end;'}
    ${maxWidthEnter && `max-width: ${maxWidthEnter};`}
  `
  
const Flex = styled.div`
  ${defaultStyles}
  ${props => props.styles}
  gap: ${props => props.gap || '0px'};
  margin: ${props => props.margin || '0px'};
  @media screen and (max-width: ${props => props.maxWidthEnter || ''}) {
    display: flex;
    flex-direction: column;
  }
`



export default Flex
