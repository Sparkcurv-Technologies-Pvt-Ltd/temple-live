import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials, selectCurrentUser } from '@modules/Auth/authSlice'
import SignInForm from './SignInForm'
import { baseRequest } from '@request/request'
import { OpenNotification } from '@components/common'
import { toast } from 'react-toastify'
import { APIURLS } from '@request/apiUrls/urls'
import { SvgIcons } from '@assets/Svg'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

export const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: stretch;
  font-family: 'Plus Jakarta Sans', sans-serif;
`

const LeftPanel = styled.div`
  flex: 1;
  position: relative;
  background: #1E0205;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  overflow: hidden;

  @media (max-width: 900px) {
    display: none;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(197,160,89,0.15) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(128,0,0,0.35) 0%, transparent 55%);
    pointer-events: none;
  }
`

const TempleIllustration = styled.div`
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1582510003544-4d00b7f74220?crop=entropy&cs=srgb&fm=jpg&q=80&w=900');
  background-size: cover;
  background-position: center;
  opacity: 0.22;
`

const LeftContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  animation: ${fadeIn} 0.8s ease both;
`

const GoldDivider = styled.div`
  width: 56px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #C5A059, transparent);
  margin: 20px auto;
  border-radius: 2px;
`

const Tagline = styled.p`
  color: rgba(255,255,255,0.7);
  font-size: 15px;
  line-height: 1.7;
  max-width: 340px;
  margin: 0 auto;
  letter-spacing: 0.02em;
`

const RightPanel = styled.div`
  width: 480px;
  min-height: 100vh;
  background: #FAF8F5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  position: relative;

  @media (max-width: 900px) {
    width: 100%;
    padding: 48px 24px;
  }
`

const SignInCard = styled.div`
  width: 100%;
  max-width: 360px;
  animation: ${fadeIn} 0.7s ease 0.1s both;
`

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`

const BrandIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #800000 0%, #5A0000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(128,0,0,0.4);
  font-size: 22px;
  color: #C5A059;
  flex-shrink: 0;
`

const BrandName = styled.h1`
  font-size: 26px;
  font-weight: 800;
  color: #800000;
  letter-spacing: -0.5px;
  margin: 0;
  line-height: 1;
`

const WelcomeText = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1E293B;
  margin: 28px 0 6px;
  letter-spacing: -0.3px;
`

const SubText = styled.p`
  font-size: 14px;
  color: #64748B;
  margin: 0 0 32px;
  line-height: 1.5;
`

const Footer = styled.p`
  position: absolute;
  bottom: 24px;
  font-size: 12px;
  color: #94A3B8;
  text-align: center;
`

const UserSignin = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (data) => {
    setIsLoading(true)
    try {
      const authData = await baseRequest.post(`${APIURLS.LOGIN}`, { ...data })
      if (authData?.data !== '') {
        localStorage.setItem('persist', JSON.stringify(authData?.data))
        dispatch(setCredentials(authData.data))
        OpenNotification({ type: 'success', msg: `Welcome Back ${authData.data?.username}` })
        navigate('/', { replace: true })
      } else {
        toast.error('UserName or Password is incorrect')
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error('Unauthorized access. Please contact the admin!')
      } else {
        toast.error('Network error: Unable to connect to the server!')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const token = useSelector(selectCurrentUser);
  useEffect(() => {
    if (token) navigate('/')
  }, [token])

  return (
    <Wrapper>
      <LeftPanel>
        <TempleIllustration />
        <LeftContent>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <img src={SvgIcons.Logoimg} width="72px" height="72px" alt="Temple Logo" />
          </div>
          <h2 style={{ color: '#C5A059', fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Temple Management
          </h2>
          <GoldDivider />
          <Tagline>
            A comprehensive platform to manage members, collections,
            festivals, funds and financial records — all in one place.
          </Tagline>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 48 }}>
            {['Members', 'Collections', 'Reports'].map(label => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ color: '#C5A059', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </LeftContent>
      </LeftPanel>

      <RightPanel>
        <SignInCard>
          <BrandRow>
            <img src={SvgIcons.Logoimg} width="46px" alt="Temple Logo" style={{ flexShrink: 0 }} />
            <BrandName>Temple</BrandName>
          </BrandRow>
          <WelcomeText>Welcome back</WelcomeText>
          <SubText>Sign in to your account to continue</SubText>
          <SignInForm handleSignIn={handleSignIn} isLoading={isLoading} />
        </SignInCard>
        <Footer>Temple Management System &copy; {new Date().getFullYear()}</Footer>
      </RightPanel>
    </Wrapper>
  )
}

export default UserSignin
