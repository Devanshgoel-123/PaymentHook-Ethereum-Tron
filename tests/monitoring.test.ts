import axios from "axios";

describe("Monitoring Registration", () => {
  test("Should register Ethereum address for monitoring", async () => {
    const res = await 
      axios.post("http://localhost:3000/api/monitor/register",{
            "address":"0x2F60554FADA00a128e53b055a5eBfeFe6Fc2D53b",
            "amount":"0.1",
            "token":"0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "chain":2
      })
    const object = res.data.result;
    expect(res.status).toBe(200);
    expect(object.address).toBe("0x2F60554FADA00a128e53b055a5eBfeFe6Fc2D53b");
    expect(object.expectedAmount).toBe("0.1");
    expect(object.status).toBe("monitoring");
  });

  test("Should register Tron address for monitoring", async () => {
    const res = await 
      axios.post("http://localhost:3000/api/monitor/register",{
            "address":"TDYQKSbY4xBCXvu25eJgb5FfuaW1kuA6ks",
            "amount":"41,476.74",
            "token":"TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
            "chain":2
      })
      const object = res.data.result;
      expect(res.status).toBe(200);
      expect(object.address).toBe("TDYQKSbY4xBCXvu25eJgb5FfuaW1kuA6ks");
      expect(object.expectedAmount).toBe("41,476.74");
      expect(object.status).toBe("monitoring");
  });

});
