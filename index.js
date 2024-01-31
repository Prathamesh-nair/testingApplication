require("dotenv").config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const { default: axios } = require("axios");
const express = require("express");
const app = express();
const port = 3000;

app.get("/:id", async (req, res) => {
  const id = req.params.id;
  const BSEUCCBody = {
    username: "12798",
    password: "Angel@123",
    apiName: "uci_clientupload",
  };

  const BSEUCCHeaders = {
    "Content-Type": "application/json",
    Cookie: process.env.BSE_COOKIE,
  };

  try {
    const BSEUCCPANResponse = await axios.get(
      `https://192.168.253.207/getBSEUCCStatus?partyCode=${id}`,
      { BSEUCCHeaders, BSEUCCBody }
    );

    const NSEUCCPANResponse = await axios.get(
      `https://192.168.253.207/getNSEUCCStatus?partyCode=${id}`
    );

    const NSEresponseListPAN = NSEUCCPANResponse.data.data[0].uccStatusData;

    // Extracting CLIENTCODE and PANSTATUS from the response
    const BSERESPONSE = BSEUCCPANResponse.data.data.ResponceListPAN;

    // Getting Details from BSE Response
    const { CLIENTCODE, PANSTATUS } = BSERESPONSE[0];

    // Getting Details from NSE Response
    const clientInfo = NSEresponseListPAN.find(
      (client) => client.clientCode === id
    );

    if (clientInfo) {
      // Extract PAN status and exchange status
      const { clientCode, panStatus, exchangeStatus } = clientInfo;

      //   // Send the response to the client
      res.status(200).json({
        BSE_PAN_STATUS: {
          clientCode: CLIENTCODE,
          panStatus: PANSTATUS,
        },
        NSE_PAN_STATUS: {
          clientCode,
          panStatus,
          exchangeStatus,
        },
      });
    } else {
      //   // If client code is not found in the response
      res.status(404).json({ status: false, message: "Client code not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
