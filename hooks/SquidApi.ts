import axios from "axios";

export async function getDataFromSquidApi() {
  try {
    const res = await axios.post(
      "https://apiplus.squidrouter.com/v2/route",
      {
        fromChain: "42161",
        fromToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        fromAddress: "0x0000000000000000000000000000000000000000",
        fromAmount: "1000000000000000",
        toChain: "1284",
        toToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        toAddress: "0x00ce496A3aE288Fec2BA5b73039DB4f7c31a9144",
        quoteOnly: true,
        enableBoost: true,
      },
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json",
          "sec-ch-ua":
            '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "x-integrator-id":
            "squid-v21-swap-widget-449AA6D3-42BC-450A-B66A-9D68D9534E95",
          Referer: "https://app.squidrouter.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      }
    );
    return res;
  } catch (err) {
    return err;
  }
}
