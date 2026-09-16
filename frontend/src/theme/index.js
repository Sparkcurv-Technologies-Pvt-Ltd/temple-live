const ROOT = {

    // =====  PRIMARY COLORS  ===========
  
    primary: '#800000',
    primary_color_dark: '#5A0000',
    primary_color_light: '#A31C1C',
    primary_color_gray1: '#334155',
    primary_color_gray2: '#64748B',
    
    secondary: '#C5A059',
    secondary_color_dark: '#B8902A',
    secondary_color_light: '#E5C889',

  
    // ======  Color  ======
    blue: '#96ADFF',
    indigo: '#6610f2',
    purple: '#6f42c1',
    pink: '#e83e8c',
    red: '#FF8787',
    black:'#000000',
    orange: '#fd7e14',
    yellow: '#ffc107',
    green: '#28a745',
    teal: '#20c997',
    cyan: '#17a2b8',
    white: '#fff',
    gray: '#6c757d',
    gray_dark: '#343a40',
    success: '#28a745',
    info: '#17a2b8',
    warning: '#ffc107',
    danger: '#dc3545',
    light: '#f8f9fa',
    dark_gold: '#FFB302',
    dark: '#343a40',
    danger_2:'#fff',
    primary_2:'#28aaeb',
    table_head:'#262626 ',
    table_content:'#545454',
    table_nthchild:'#f8f8f8',
  
    // ======  SIZES  ======
  
    gutter_x: '1.5rem',
    gutter_y: '0',
    BTN_PRIMART: '#4f46e5',
    BTN_PRIMART_HOVER: 'rgb(55, 48, 163)',
    BTN_SECONDARY: '#334155',
    BTN_SECONDARY_HOVER: '#990000',
    TRANSPARENT: '#00000000',
    TRANSPARENT_HOVER: 'rgba(17, 24, 39, 0.04)',
  
  
    // =========  linear Gradiant ======
    linear_gradiant1: 'linear-gradient(90deg, rgba(17,94,223,1) 2%, rgba(17,189,224,1) 91%)',
    linear_gradiant2: ' linear-gradient(90deg, #8056F7 0%, #AE92FF 100%)',
    // =========  Box Shadow ======
    button_box_shadow: 'rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;',
    buttonHover_box_shadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px;',
  
    form_box_shadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px;',
    formHover_box_shadow: 'rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;'
  }
  
  // =======  Media Queryies Start  ========
  
  // ===========  Define breakpoints  ===========
  
  const SIZES = {
    // mobileS: '320px',
    MOBILEM: '375px',
    MOBILEL: '576px',
    TABLET: '768px',
    LAPTOP: '992px',
    LAPTOPL: '1200px',
    DESKTOP: '1400px',
    DESKTOPL: '1800px',
  }
  
  // ===========  Define DEVICES  ===========
  
  const DEVICES = {
    MOBILEM: `(min-width: ${SIZES.MOBILEM})`,
    MOBILEL: `(min-width: ${SIZES.MOBILEL})`,
    TABLET: `(min-width: ${SIZES.TABLET})`,
    LAPTOP: `(min-width: ${SIZES.LAPTOP})`,
    LAPTOPL: `(min-width: ${SIZES.LAPTOPL})`,
    DESKTOP: `(min-width: ${SIZES.DESKTOP})`,
    DESKTOPL: `(min-width: ${SIZES.DESKTOPL})`,
  }
  
  const ANTD_COLORS = {
    PRIMARY: '#007bff', // primary color for all components
    LINK: '#2B69A9', // link color
    SUCCESS: '#52c41a', // success state color
    WARNING: '#faad14', // warning state color
    ERROR: '#f5222d', // error state color
    GEEK_BLUE: 'geekblue', //special blue AntD tags
    HEADING: '#242E39', // heading text color
    TEXT_PRIMARY: '#242E39', // major text color
    TEXT_SECONDARY: '#637487', // secondary text color
    DISABLED: 'rgba(0, 0, 0, .25)', // disable state color
    BORDER: '#d9d9d9', // major border color
  }
  
  const GREY_COLORS = {
    GREY_S_70: '#161C22',
    GREY_S_50: '#242E39',
    GREY_S_30: '#324050',
    GREY_S_20: '#3A4A5B',
    GREY_S_10: '#415367',
    GREY_100: '#485C72',
    GREY_T_15: '#637487',
    GREY_T_25: '#768595',
    GREY_T_35: '#8895A3',
    GREY_T_50: '#A3ADB8',
    GREY_T_65: '#BFC6CE',
    GREY_T_75: '#D1D6DC',
    GREY_T_85: '#E4E7EA',
    GREY_T_92: '#F0F2F4',
    GREY_T_96: '#F8F8F9',
    GREY_T_98: '#FBFCFC',
    GREY_PALE: '#6B6B6B',
  }
  
  const GREEN_COLOR = {
    GREEN_PRIMARY: '#28a745',
    GREEN_DARK: '#4cb187',
    GREEN_LIGHT: '#3d8e6c',
    GREEN_T_15: '#47BA78',
    GREEN_T_50: '#93D7AF',
    GREEN_T_96: '#F6FCF9',
    GREEN_T_75: '#C9EBD7',
    GREEN_T_85: '#15803d',
    GREEN_S_56: '#5DC288',
    GREEN_100: '#27AB66',
    GREEN_PALE: '#39AE41'
  }
  
  const BLUE_COLORS = {
    BLUE_S_10: '#8056F7',
    BLUE_S_37: '#275F98',
    BLUE_T_15: '#3D7AB6',
    BLUE_T_25: '#548ABF',
    BLUE_T_50: '#8DB1D4',
    BLUE_T_65: '#AFC8E1',
    BLUE_T_69: '#8DB1D4',
    BLUE_T_92: '#EDF3F8',
    BLUE_S_30: '#134576',
    BLUE_100: '#1B63A9',
    BLUE_T_96: '#F6F9FC',
    BLUE_T_75: '#C6D8E9',
    BLUE_T_85: '#DDE8F2',
  }
  
  const RED_COLORS = {
    RED_T_15: '#E04C4C',
    RED_T_25: '#E46161',
    RED_T_96: '#FEF7F7',
    RED_T_75: '#F7CCDA',
    RED_T_85: '#FADFDF',
    RED_S_49: '#C52828',
    RED_S_50: '#6E1616',
    RED_S_100: '#FD0000',
    RED_100: '#DD326C',
  }
  
  const ORANGE_COLORS = {
    
    YELLOW_OR_80: '#FFA642',
    YELLOW_T_85: '#FFFBE6',
    YELLOW_OR_50: '#FFBE4B',
    YELLOW_T_96: '#FFFEF8',
    YELLOW_T_35: '#FFEF94',
    YELLOW_T_75: '#FFF9D6',
    YELLOW_T_92: '#FFFDF2',
    YELLOW_T_50: '#FFF3AC',
  }
  
  const PURPLE_COLORS = {
    PRIMARY_PURPLE: '#8056F7',
    PURPLE_T_80: '#8056F7',
    PURPLE_T_96: '#FAF8FC',
    PURPLE_T_75: '#E0D1EF',
    PURPLE_100: '#8246BE',
    PURPLE_T_85: '#ECE3F5',
  }
  
  
  /**
   * CONFIGURE THEME HERE
   * **/
  export const THEME = {
    ...ANTD_COLORS,
    ...GREY_COLORS,
    ...GREEN_COLOR,
    ...BLUE_COLORS,
    ...RED_COLORS,
    ...ORANGE_COLORS,
    ...PURPLE_COLORS,
    ...ROOT,
    ...DEVICES,
  }
