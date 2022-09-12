
require('dotenv').config();

const {Router} = require('express')
const admin = require("firebase-admin");
admin.initializeApp({
  // credential: applicationDefault(),
  databaseURL: 'https://pettysavetesting.firebaseio.com'
});


const app = Router()

// allow cross-origin requests


// TODO: Implement body-parser

// use firestore
const db = admin.firestore();

const allPerks = require("./perks.js");

// rapyd credentials
const rapydSecretKey = process.env.RAPYD_SECRET
const rapydAccessKey =  process.env.RAPYD_ACCESS

// rapyd base uri
// eslint-disable-next-line no-unused-vars
const rapydBaseURL = "https://sandboxapi.rapyd.net";
const applink =  'localhost'
// axios to request rapyd API
const axios = require("axios");
axios.defaults.baseURL = rapydBaseURL;

// const crypto = require("crypto");
const cryptoJS = require("crypto-js");


// --------------- Middleware/Helpers --------------- //

// eslint-disable-next-line no-unused-vars
const handleError = (err, res) => {
  if (typeof err !== "object" || typeof err.status !== "number") {
    err = {
      status: 500,
      reason: "INTERNAL_SERVER_ERROR",
      reason_detail: err ? err.toString() : undefined,
    };
  }

  console.error(err);
  res.status(err.status).json(err).end();
};

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res, next) => {
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    const err = {
      status: 403,
      reason: "Unauthorized",
      reason_detail:
        "No Firebase ID token was passed as a Bearer token in the Authorization header or as cookie",
    };
    handleError(err, res);
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    console.log("Found \"Authorization\" header");
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    console.log("Found \"__session\" cookie");
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    const err = {
      status: 403,
      reason: "Unauthorized",
    };
    handleError(err, res);
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    console.log("ID Token correctly decoded", decodedIdToken);
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    console.error("Error while verifying Firebase ID token:", error);
    const err = {
      status: 403,
      reason: "Unauthorized",
    };
    handleError(err, res);
    return;
  }
};

const generateRapydHeaders = (httpMethod, urlPath, body = "") => {
  // const salt = parseInt(crypto.randomBytes(5).toString("hex"), 16).toString();
  // Randomly generated for each request.
  const salt = cryptoJS.lib.WordArray.random(12).toString();
  const timestamp = (Math.floor(new Date().getTime() / 1000) - 10).toString();
  const toSign = httpMethod + urlPath + salt + timestamp + rapydAccessKey +
    rapydSecretKey + body;
  let signature = cryptoJS.enc.Hex.stringify(
      // eslint-disable-next-line new-cap
      cryptoJS.HmacSHA256(toSign, rapydSecretKey));
  signature = cryptoJS.enc.Base64.stringify(cryptoJS.enc.Utf8.parse(signature));
  return {
    "Content-Type": "application/json",
    "access_key": rapydAccessKey,
    "salt": salt,
    "timestamp": timestamp,
    "signature": signature,
  };
};


// --------------- Rapyd API Calls --------------- //

const createWallet = async (
    firstName,
    lastName,
    email,
    businessName,
    address1,
    city,
    state,
    zip,
    phone,
) => {
  const httpMethod = "post";
  const urlPath = "/v1/user";

  // TODO: improve this logic
  if (phone.length == 10) {
    phone = "+1" + phone;
  } else if (phone.length == 11) {
    phone = "+" + phone;
  }
  console.log(phone);

  const body = {
    "first_name": businessName,
    "type": "company",
    "contact": {
      "phone_number": phone,
      "email": email,
      "first_name": firstName,
      "last_name": lastName,
      "contact_type": "business",
      "address": {
        "name": businessName,
        "line_1": address1,
        "city": city,
        "state": state,
        "country": "US",
        "zip": zip,
        "phone_number": phone,
      },
      "country": "US",
      "business_details": {
        "entity_type": "company",
        "name": businessName,
        "address": {
          "name": businessName,
          "line_1": address1,
          "city": city,
          "state": state,
          "country": "US",
          "zip": zip,
          "phone_number": phone,
        },
      },
    },
  };
  /*
  const body = {
    "first_name": "Henry Company",
    "type": "company",
    "contact": {
      "phone_number": "+14155588799",
      "email": "sanboxtest@rapyd.net",
      "first_name": "Mary",
      "last_name": "Chen",
      "contact_type": "business",
      "address": {
        "name": "Henry Company",
        "line_1": "888 Some Street",
        "city": "Anytown",
        "state": "NY",
        "country": "US",
        "zip": "12345",
        "phone_number": "+14155588799",
      },
      "country": "US",
      "business_details": {
        "entity_type": "company",
        "name": "Henry Company",
        "address": {
          "name": "Henry Company",
          "line_1": "888 Some Street",
          "line_2": "Suite 1200",
          "city": "Anytown",
          "state": "NY",
          "country": "US",
          "zip": "10101",
          "phone_number": "+14155588799",
        },
      },
    },
  };
   */
  /*
  const body = {
    "first_name": businessName,
    "type": "company",
    "contact": {
      "phone_number": phone,
      "email": email,
      "first_name": firstName,
      "last_name": lastName,
      "contact_type": "business",
      "address": {
        "name": businessName,
        "line_1": address1,
        "city": city,
        "state": state,
        "country": "US",
        "zip": zip,
        "phone_number": phone,
      },
      "country": "US",
      "business_details": {
        "entity_type": "company",
        "name": businessName,
        "address": {
          "name": businessName,
          "line_1": address1,
          "city": city,
          "state": state,
          "country": "US",
          "zip": zip,
          "phone_number": phone,
        },
      },
    },
  };
   */
  const headers = generateRapydHeaders(httpMethod, urlPath,
      JSON.stringify(body));
  console.log(headers);
  try {
    const walletResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    const walletID = walletResp.data.data.id;
    const contactID = walletResp.data.data.contacts.data[0].id;
    console.log(walletID);
    console.log(contactID);
    return {walletID, contactID};
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// eslint-disable-next-line no-unused-vars
const getWallet = async (walletID) => {
  const httpMethod = "get";
  const urlPath = "/v1/user/" + walletID;
  const headers = generateRapydHeaders(httpMethod, urlPath);
  try {
    const walletResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return walletResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// eslint-disable-next-line no-unused-vars
const addContact = async (walletID, firstName, lastName, email, address, city, state, zip, dob) => {
  // TODO: fix DOB static
  const httpMethod = "post";
  const urlPath = `/v1/ewallets/${walletID}/contacts`;
  const body = {
    "first_name": firstName,
    "last_name": lastName,
    "contact_type": "personal",
    "email": email,
    "date_of_birth": "11/22/2000",
    "country": "US",
    "address": {
      "name": firstName+" "+lastName,
      "line_1": address,
      "city": city,
      "state": state,
      "zip": zip,
    },
  };

  const headers = generateRapydHeaders(httpMethod, urlPath, JSON.stringify(body));
  try {
    const newContact = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    return newContact.data;
  } catch (e) {
    console.error("in add contact");
    console.error(e);
    throw e;
  }
};

// eslint-disable-next-line no-unused-vars
const depositWallet = async (walletID, amount) => {
  const httpMethod = "post";
  const urlPath = "/v1/account/deposit";
  const body = {
    "ewallet": walletID,
    "amount": amount.toString(),
    "currency": "USD",
  };
  const headers = generateRapydHeaders(httpMethod, urlPath, JSON.stringify(body));
  try {
    const walletResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return walletResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const issueCard = async (contactID) => {
  const httpMethod = "post";
  const urlPath = "/v1/issuing/cards";
  const body = {
    "ewallet_contact": contactID,
    "country": "US",
  };
  const headers = generateRapydHeaders(httpMethod, urlPath, JSON.stringify(body));
  try {
    const cardResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return cardResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const activateCard = async (cardID) => {
  const httpMethod = "post";
  const urlPath = "/v1/issuing/cards/activate";
  const body = {
    "card": cardID,
  };
  const headers = generateRapydHeaders(httpMethod, urlPath, JSON.stringify(body));
  try {
    const cardResp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return cardResp.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const getCardDetails = async (cardID) => {
  const httpMethod = "post";
  const urlPath = "/v1/hosted/issuing/card_details/"+cardID;
  const body = {
    "card_color": "#f9f9f9",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTNgldxyUfmVPmQV1YpTcDWo_kjX-TO_EiccQ&usqp=CAU",
    "language": "en",
    "logo_orientation": "landscape",
  };
  const headers = generateRapydHeaders(httpMethod, urlPath, JSON.stringify(body));
  try {
    const cardDetails= await axios({
      method: httpMethod,
      url: urlPath,
      headers,
      data: body,
    });
    // const walletAddress = walletResp.data.data.contacts.data[0].business_details.address;
    return cardDetails.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// --------------- Express Routes --------------- //

const getTest = async (req, res) => {
  const busname = await db.collection("businesses").doc("j5SZ8oT473otpqRuI49g").get();
  res.json({success: busname.data()}).end();
};

const getRapydTest = async (req, res) => {
  const httpMethod = "get";
  const urlPath = "/v1/data/countries";
  const headers = generateRapydHeaders(httpMethod, urlPath);
  try {
    const resp = await axios({
      method: httpMethod,
      url: urlPath,
      headers,
    });
    console.log(resp);
    res.json().end();
  } catch (e) {
    console.error(e);
  }
};

const registerAdminAndBusiness = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    businessName,
    address1,
    city,
    state,
    zip,
    phone,
    ...rest
  } = JSON.parse(req.body);
  // TODO: make sure we still need to do JSON parse
  // let globalWalletID;

  try {
    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: "extraneous parameters",
        reason_detail: Object.keys(rest).join(","),
      };
      throw error;
    }

    // create company with rapyd API
    const {walletID, contactID} = await createWallet(
        firstName,
        lastName,
        email,
        businessName,
        address1,
        city,
        state,
        zip.toString(),
        phone.toString(),
    );
    // globalWalletID = walletID;

    const newUser = await admin.auth().createUser({
      email,
      emailVerified: false,
      password,
      displayName: firstName + " " + lastName,
      disabled: false,
    });

    const businessRef = await db.collection("businesses").add({
      name: businessName,
      walletID,
      admins: [newUser.uid],
      groups: {},
    });

    await db.collection("admins").doc(newUser.uid).set({
      email,
      firstName,
      lastName,
      contactID,
      "companyID": businessRef.id,
    });

    res.status(200).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    handleError(err, res);
  }
};

const createGroup = async (req, res) => {
  try {
    const {
      group, // TODO: make this param
      emails,
      perks,
      ...rest
    } = req.body;

    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: "extraneous parameters",
        reason_detail: Object.keys(rest).join(","),
      };
      throw error;
    }

    // get admins business
    const adminSnap = await db.collection("admins").doc(req.user.uid).get();
    const businessID = adminSnap.data().companyID;

    // query business for address and wallet
    const businessSnap = await db.collection("businesses").doc(businessID).get();
    const walletID = businessSnap.data().walletID;

    // charge wallet for price*perks*employees
    // TODO: setup monthly charges
    // TODO: charge via rapyd collect
    let price = 0;
    for (const aPerk of allPerks) {
      price += emails.length * (perks.includes(aPerk.Name) * aPerk.Cost);
    }
    const depositResult = await depositWallet(walletID, price);

    // add group and perks to db
    // TODO: reuse businessSnap
    await db.collection("businesses").doc(businessID).update({
      [`groups.${group}`]: perks,
    });

    // create user entry with email, companyID, and groupID
    for (const email of emails) {
      await db.collection("users").doc(email).set({
        businessID,
        group,
        "perks": [],
      });
      await db.collection("mail").add({
        to: email,
        message: {
          subject: "Your employer has signed",
          text: `Your employee gave you free access to these perks:${perks} \n
                To claim these perks, finish the signup process by visiting: ${applink}/getcard`,
        },
      });
    }

    // << ALL BELOW HAPPENS LATER IN FLOW >>
    // get name, and dob
    // issue card
    // issue and then activate cards
    // send initial email to get cards

    res.json(depositResult).end();
  } catch (err) {
    // TODO: if globalWalletID is set then use rapid api to delete the wallet
    handleError(err, res);
  }
};

const registerUser = async (req, res) => {
  const {
    email, // TODO: make this param
    // eslint-disable-next-line no-unused-vars
    firstName,
    // eslint-disable-next-line no-unused-vars
    lastName,
    // eslint-disable-next-line no-unused-vars
    dob,
    ...rest
  } = JSON.parse(req.body);

  // TODO: check none of params empty

  try {
    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: "extraneous parameters",
        reason_detail: Object.keys(rest).join(","),
      };
      throw error;
    }

    // TODO: get field directly
    const userSnap = await db.collection("users").doc(email).get();
    const businessID = userSnap.data().businessID;
    const businessSnap = await db.collection("businesses").doc(businessID).get();
    const walletID = businessSnap.data().walletID;
    const walletResp = await getWallet(walletID);
    let walletAddress;
    for (const contact of walletResp.data.contacts.data) {
      console.log(contact);
      if (contact.contact_type==="business") {
        walletAddress = contact.business_details.address;
      }
    }
    if (!walletAddress) {
      walletAddress = walletResp.data.contacts.data[walletResp.data.contacts.data.length-1].address;
    }
    // eslint-disable-next-line no-unused-vars
    // TODO: support address line_2
    console.log(walletAddress);
    const newContact = await addContact(walletID, firstName, lastName, email, walletAddress.line_1, walletAddress.city, walletAddress.state, walletAddress.zip.toString(), dob.toString());
    const newContactID = newContact.data.id;

    const newCard = await issueCard(newContactID);
    const cardID = newCard.data.card_id;

    console.log(cardID);

    await activateCard(cardID);

    await db.collection("users").doc(email).update({
      firstName: firstName,
      lastName: lastName,
      contactId: newContactID,
      cardID: cardID,
    });

    const cardDetails = await getCardDetails(cardID);
    const cardLink = cardDetails.data.redirect_url;

    const yourPerks = businessSnap.data().groups[userSnap.data().group];

    // send email
    await db.collection("mail").add({
      to: email,
      message: {
        subject: "Your  card is ready!",
        text: `We have generated your  credit card details.\n 
        Use this link to see your card details and purchase any of your valid subscriptions: ${cardLink}.\n 
        The link above is only active for 5 minutes, to get a new link, go here: https://${applink}/view-my-card \n
        
        Your supported perks are:
        ${yourPerks.toString()} 
        `,
      },
    });

    res.status(200).end();
  } catch (err) {
    handleError(err, res);
  }
};

const sendCardEmail = async (req, res) => {
  const {email, ...rest} = req.params;

  try {
    if (Object.keys(rest).length > 0) {
      const error = {
        status: 400,
        reason: "extraneous parameters",
        reason_detail: Object.keys(rest).join(","),
      };
      throw error;
    }

    // TODO: get field directly
    const userSnap = await db.collection("users").doc(email).get();
    const cardID = userSnap.data().cardID;
    const businessID = userSnap.data().businessID;
    const businessSnap = await db.collection("businesses").doc(businessID).get();

    if (!cardID) {
      const error = {
        status: 400,
        reason: "need to sign up first",
        reason_detail: "${applink}/getcard",
      };
      throw error;
    }

    const cardDetails = await getCardDetails(cardID);
    const cardLink = cardDetails.data.redirect_url;

    const yourPerks = businessSnap.data().groups[userSnap.data().group];

    // send email
    await db.collection("mail").add({
      to: email,
      message: {
        subject: "Your  card",
        text: `
        Use this link to see your card details and purchase any of your valid subscriptions: ${cardLink}.\n 
        The link above is only active for 5 minutes, to get a new link, go here: ${applink}/view-my-card \n
        
        Your supported perks are:
        ${yourPerks.toString()} 
        `,
      },
    });

    res.status(200).end();
  } catch (err) {
    handleError(err, res);
  }
};

app.use("/auth", validateFirebaseIdToken);
app.get("/test", getTest);
app.get("/rapydtest", getRapydTest);
app.post("/registerAdminAndBusiness", registerAdminAndBusiness);
app.post("/registerUser", registerUser);
app.get("/sendCardEmail/:email", sendCardEmail);
app.post("/auth/createGroup", createGroup);

module.exports =  app
