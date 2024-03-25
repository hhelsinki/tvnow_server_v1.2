interface MailSignupProps {
    email: string, username: string, password: string, token: string
}
interface MailTwoFacProps {
    email: string, id_token: number, timekey_token: string
}
interface MailChangePassProps {
    email: string, token: string
}
interface MailForgotPassProps {
    email: string, username: string, password: string
}