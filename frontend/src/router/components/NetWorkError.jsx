import React, { Fragment } from 'react'
// import Button from './Form/CustomButton'
import { useLocation, useNavigate } from 'react-router-dom'

export const NetWorkError = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const goBack = () => {
        navigate(location.state.previousUrl) // Go back one step in the history
    };

    return (
        <Fragment>
            <div>NetWorkError</div>
            {/* <Button.Primary text={'Refresh'} onClick={() => goBack()} /> */}
        </Fragment>
    )
}