const { generateToken } = require('../../util/token');
const { checkPassword } = require('../../util/password');

module.exports = function ChangepwdSevice({userModel, CustomError, env}) {
    return function handle(httpRequest) {
        const { method } = httpRequest;
        switch(method) {
            case 'POST':
                return changepwd(httpRequest);
            default:
                const error = CustomError({message: 'Method not allowed.', status: 405});
                return error.handle();
        }
    }

    async function changepwd(httpRequest) {
        try {
            const { cnf_password, old_password, new_password } = httpRequest.body;
            const { id, email } = httpRequest.user;

            let username = email
            const user = await userModel.getUserByUsername({ username });
            let error;
            if (!user) {
                error = CustomError({ message: 'Invalid username or password.', status: 401 });
                return error.handle();
            }
            if (user.Status == 'N') {
                error = CustomError({ message: 'Your account is blocked. Please contact admin.', status: 401 });
                return error.handle();
            }
            if (!checkPassword(cnf_password, new_password)) {
                error = CustomError({ message: 'New Password Confirm password Not matched', status: 401 });
                return error.handle();
            }
            if (checkPassword(old_password, new_password)) {
                error = CustomError({ message: 'Please try with a diffrent Password', status: 401 });
                return error.handle();
            }
            if (checkPassword(old_password, user.Password)) {

                const updatepwd = await userModel.updatePassword({new_password, id, username });

                let U_id = id;
                let Screen = 'Change Password Screen';
                let Action = 'Password Changed';

                if(updatepwd == 1){
                    return {
                        status: 200,
                        data: {
                            status: 200,
                            message: "Successful",
                        }
                    }
                }else{
                    error = CustomError({ message: 'Something Went Worng Please Try Again.', status: 401 });
                    return error.handle();
                }

            } else {
                error = CustomError({ message: 'Wrong Account Password', status: 401 });
                return error.handle();
            }
        } catch(err) {
            const error = CustomError(err);
            return error.handle();
        }
    }
}