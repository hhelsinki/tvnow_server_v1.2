export const error_user_list = {
    INVALID_CREDENTIAL: 'Please login before processing.',
    INVALID_VERIFY: 'Please check your email to activate this account.',
    INVALID_SIGNIN_TIME: 'Please login again at',
    INVALID_GIFTCODE: 'Invalid giftcard code.',
    INVALID_EMAIL: 'The email format is not valid',
    INVALID_TOKEN: 'This token is not valid.',
    INVALID_PASSWORD: 'This password is not valid.',
    INVALID_PASSWORD_REQ: 'The password must contains the minimum required.',
    INVALID_CONFIG: 'Something is missing, please proceed the sign up again.',
    DUPLICATE_GIFTCODE: 'This giftcard code is already in used.',
    DUPLICATE_USERNAME: 'This username is already in used.',
    DUPLICATE_EMAIL: 'This email is already in used.',
    NOTFOUND_USERNAME: 'This username is not exist.',
    NOTFOUND_EMAIL: 'This email is not exist.',
}

export const success_user_list = {
    VALID_GIFTCODE: 'This code can be used.',
    VALID_USERNAME: 'This username can be used.',
    VALID_EMAIL: 'This email can be used.',
    SUCCESS_SIGNOUT: 'Signout successfully.',
    SUCCESS_SAVE_PASSWORD: 'The password is successfully saved.',
    SUCCESS_SAVE_TWOFAC: 'The two factor is successfully saved.',
    SUCCESS_MAIL_TOKEN: 'The 6 digit key is send to your email.',
    SUCCESS_MAIL_CHANGE_PASS: 'Please check your email to change the password.',
    SUCCESS_MAIL_GET_PASS: 'Please check your email to get the password.',
    SUCCESS_MAIL_SIGNUP: 'Thank you for using our service, kindly check your email to activate this account.',
    SUCCESS_REDEEM_CODE: 'The giftcode is successfully redeem.',
}

export const error_internal_list = {
    FAILED_LINE: 'Line: ',
    FAILED_UPSERT_DB: 'Failed to upsert to Database:***',
    FAILED_SIGNUP: 'Failed to sign up.',
    FAILED_SAVE_PASSWORD: 'Failed to save the password.',
    FAILED_SAVE_TWOFAC: 'Failed to save the two step login.',
    FAILED_SAVE_GIFTCODE: 'Failed to save the giftcode.',
    FAILED_SAVE_PAYMENT: 'Failed to save the payment.',
    FAILED_SAVE_AUTHEN: 'Failed to save the authenticate.',
}