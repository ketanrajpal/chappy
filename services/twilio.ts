"use server";

import twilio from "twilio";

const accountSid = process.env.REACT_APP_ACCOUNT_SID;
const authToken = process.env.REACT_APP_AUTH_TOKEN;

export const client = twilio(accountSid, authToken);
