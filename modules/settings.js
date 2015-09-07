module.exports = {
    tokenExpireTime: 3600,
    errorPersistsMsg: "If the error persists, please contact the support at support@hushtag.co.uk",
    authFailedResponse: {status: "fail", msg: "Your authentication failed. Log out and back in please. "+this.errorPersistsMsg},
    serverError: {status: "fail", msg: "Sorry, there is a server issue. Please wait at least an hour before trying that again. "+this.errorPersistsMsg}
};
