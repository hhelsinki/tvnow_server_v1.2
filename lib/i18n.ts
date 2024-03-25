export const error_user_list = {
    INVALID_CREDENTIAL: 'Please login before processing.',
    INVALID_VERIFY: 'Please check your email to activate this account.',
    INVALID_SIGNIN_TIME: 'Please login again at',
    INVALID_GIFTCODE: 'Invalid giftcard code.',
    INVALID_USERNAME: 'This username is not exist.',
    INVALID_EMAIL: 'This email is not exist.',
    INVALID_TOKEN: 'This token is not valid.',
    INVALID_PASSWORD: 'This password is not valid.',
    INVALID_PASSWORD_REQ: 'The password must contains the minimum required.',
    DUPLICATE_GIFTCODE: 'This giftcard code is already in used.',
    DUPLICATE_USERNAME: 'This username is already in used.',
    DUPLICATE_EMAIL: 'This email is already in used.'
}

export const success_user_list = {
    SUCCESS_TOKEN_EMAIL: 'The 6 digit key is send to your email.',
    SUCCESS_SIGNOUT: 'Signout successfully.',
    SUCCESS_SAVE_PASSWORD: 'The password is successfully saved.',
    SUCCESS_SAVE_TWOFAC: 'The two factor is successfully saved.',
    SUCCESS_MAIL_CHANGE_PASS: 'Please check your email to change the password.',
    SUCCESS_MAIL_GET_PASS: 'Please check your email to get the password.'
}

export const error_internal_list = {
    FAILED_LINE: 'Line: ',
    FAILED_UPSERT_DB: 'Failed to upsert to Database:***',
    FAILED_SAVE_PASSWORD: 'Failed to save the password.',
    FAILED_SAVE_TWOFAC: 'Failed to save the two step login.',
}