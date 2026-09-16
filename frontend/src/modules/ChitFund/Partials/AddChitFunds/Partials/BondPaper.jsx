import { Button } from '@components/form'
import { CustomRow, Flex } from '@components/others'
import { CustomPageTitle } from '@components/others/CustomPageTitle'
import { getManagement, selectManagementDetails } from '@modules/Management/ManagementSlice'
import { APIURLS } from '@request/apiUrls/urls'
import request from '@request/request'
import { Col } from 'antd'
import dayjs from 'dayjs'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { IoPrint } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import { BondContainer, PrintHolder } from '../style'
import LeftBondImage from '@assets/images/amman.jpg'
import RightBondImage from '@assets/images/sudalai.jpg'


export const BondPaper = ({ InvestorRecord, findIds, AllChitDetails }) => {

  const dispatch = useDispatch();
  const componentRef = useRef();

  const [updationsValue, setUpdationsValue] = useState({});
  const CurrentDate = dayjs().format('DD-MM-YYYY');

  useEffect(() => {
    dispatch(getManagement());
    GetDetails();
  }, []);

  const AllManagementDetails = useSelector(selectManagementDetails);

  const GetDetails = async () => {
    try {
      const response = await request.get(APIURLS.GET_INSTRUCTION);
      setUpdationsValue(response.data)
      return response.data;
    } catch (error) {
      // console.log(error.response.data, 'response error');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  return (
    <Fragment>
      <Flex spacebetween={true}>
        <div>
          <CustomPageTitle Heading={'Bond Paper'} />
        </div>
        <div><Button.Primary text={'Print'} icon={<IoPrint />} onClick={handlePrint} /> </div>
      </Flex>
      <PrintHolder ref={componentRef}>
        <BondContainer>
          <div className='Container'>
            <table style={{width: '100%'}}>
              <thead>
                <tr>
                  <th>
                    <div className='header'>
                      <div className='left-image'>
                        <img src={LeftBondImage} />
                      </div>
                      <div className='templeAddress'>
                        <h1>{AllManagementDetails?.temple_name}</h1>
                        <br />
                        <h2>{AllManagementDetails?.address}</h2>
                        <div className='top_Heading'>CHIT-FUND INVESTMANT AGREEMENT</div>
                      </div>
                      <div className='right-image'>
                        <img src={RightBondImage} />
                      </div>
                    </div>
                    <hr />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="investor_details">
                      <CustomRow space={[12, 12]}>
                        <Col span={24} sm={10} md={10}>
                          <div>
                            <h4>Chit Name: &nbsp;{findIds?.chit_name} </h4>
                            <h4>Investor name: &nbsp;{InvestorRecord?.invester_name} </h4>
                            <h4>Investor Mobile: &nbsp;{InvestorRecord?.invester_mobile} </h4>
                            <h4>Investor Address: &nbsp;{InvestorRecord?.invester_address} </h4>
                          </div>
                        </Col>
                        <Col span={24} sm={4} md={4}></Col>
                        <Col span={24} sm={10} md={10}>
                          <div>
                            <h4>Share Amount :&nbsp;{AllChitDetails?.fixed_chitfund_amount}</h4>
                            <h4>Joining Date: {InvestorRecord?.joining_date}</h4>
                            <h4>Share Count :&nbsp;{InvestorRecord?.share_count}</h4>
                            <h4>Investment Amount :&nbsp;{InvestorRecord?.investment_amt}</h4>
                          </div>
                        </Col>
                      </CustomRow>
                    </div>
                    <div className='body_content'>
                      <h3 style={{ marginBottom: '5px' }} >Terms & Conditions :-</h3>
                      <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        {updationsValue?.instruction}
                      </pre>
                    </div><br />
                    <hr /><br />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>
                    <div class="footer">
                      <Flex spacebetween={true}>
                        <h4>Date : {CurrentDate} </h4>
                        <h4>Seal / Signature</h4>
                      </Flex>
                      <div style={{ marginBottom: '130px' }}></div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </BondContainer>
      </PrintHolder>
    </Fragment>
  )
}


