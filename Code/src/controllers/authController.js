import { msalConfig, REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } from "../authConfig.js";
import { ConfidentialClientApplication, InteractionRequiredAuthError } from "@azure/msal-node";

const msalInstance = new ConfidentialClientApplication(msalConfig);

export const getAuthCodeUrl = async (req, res, next) => {
    const authCodeUrlParameters = {
        scopes: ["user.read"],
        redirectUri: REDIRECT_URI,
    };

    try {
        const authCodeUrl = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
        res.redirect(authCodeUrl);
    } catch (error) {
        next(error);
    }
};

export const acquireToken = async (req, res, next) => {
    const tokenRequest = {
        code: req.body.code, // This might need to come from req.query.code or req.body depending on POST vs GET redirect
        scopes: ["user.read"],
        redirectUri: REDIRECT_URI,
    };
    
    if(req.query.code){
        tokenRequest.code = req.query.code;
    }

    try {
        const response = await msalInstance.acquireTokenByCode(tokenRequest);
        req.session.isAuthenticated = true;
        req.session.user = response.account;
        
        res.redirect("/profile");
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect(POST_LOGOUT_REDIRECT_URI);
    });
};

export const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated || req.session.user) {
        return next();
    }
    res.redirect("/login");
};

export const auth = isAuthenticated;
