import React from 'react'
import AuthRouter from '@router/components/AuthRouter'
import { Routes, Route } from 'react-router-dom'

const Routers = ({ token }) => {

    const isAuthenticated = Boolean(token);

    return (
        <Routes>
          <Route
            path="/*"
            element={
              <AuthRouter isAuthenticated={isAuthenticated} />
            }
          />
        </Routes>
    )
}

export default Routers
