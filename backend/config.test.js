("use strict");

beforeEach(() => {
  jest.resetModules();
});

describe("config can come from env", function () {
  test("works", function () {
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DATABASE_URL = "other";
    process.env.NODE_ENV = "other";

    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5000);
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    expect(config.DB_URI).toEqual("other");
  });

  test("if node_env equals to test", () => {
    process.env.NODE_ENV = "test";
    expect(process.env.NODE_ENV).toEqual("test");

    const config = require("./config");
    expect(config.DB_URI).toEqual("postgresql:///trivia_test");
  });
});
