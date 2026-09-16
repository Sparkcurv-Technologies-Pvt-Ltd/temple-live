import React, { Fragment, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { anonymous } from '@router/config/routes'
import AuthPage from '@router/components/AuthPage'

// Path prefixes that must always render their `anonymous` route, even for
// authenticated (or non-authenticated) users. Used for shareable public
// pages such as `/statement/:token` and `/interest-statement/:token`.
const PUBLIC_ONLY_PREFIXES = ['/statement/', '/interest-statement/']

const isPublicPath = (pathname) =>
  PUBLIC_ONLY_PREFIXES.some((p) => pathname.startsWith(p))

const AuthRouter = ({ isAuthenticated }) => {

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated && !isPublicPath(location.pathname)) {
      navigate('/signin')
    }
  }, [isAuthenticated, location.pathname])

  // Public standalone routes (e.g. /statement/:token) always render outside
  // the authenticated shell, whether the user is logged in or not.
  if (isPublicPath(location.pathname)) {
    return (
      <Routes>
        {anonymous.map(({ routePath, Component }) => (
          <Route key={routePath} path={routePath} element={<Component />} />
        ))}
      </Routes>
    )
  }

  return (
    <Fragment>
      {
        isAuthenticated ? (
          <AuthPage isAuthenticated={isAuthenticated} />
        ) :
          (
            <Routes>
              {anonymous.map(({ routePath, Component }) => {
                return (
                  <Route
                    key={routePath}
                    path={routePath}
                    element={<Component />}
                  ></Route>
                )
              })}
            </Routes>
          )
      }
    </Fragment>
  )
}

export default AuthRouter
