import { expect, AssertionError, use } from "chai";
import { BigNumber as BigNumberEthers } from "ethers";
import { BigNumber as BigNumberJs } from "bignumber.js";
import BN from "bn.js";

import { bnChai } from "../../../src/chai/matchers/bnChai";

use(bnChai);

const numberToBigNumberConversions = [
  (n: number) => BigInt(n),
  (n: number) => BigNumberEthers.from(n),
  (n: number) => new BN(n),
  (n: number) => new BigNumberJs(n),
];

describe("BigNumber matchers", () => {
  function typestr(
    n: number | bigint | string | BN | BigNumberEthers | BigNumberJs
  ): string {
    if (typeof n === "object") {
      if (n instanceof BN) {
        return "BN";
      } else if (n instanceof BigNumberEthers) {
        return "ethers.BigNumber";
      } else if (n instanceof BigNumberJs) {
        return "bignumber.js";
      }
    }
    return typeof n;
  }

  describe("with two arguments", function () {
    function checkAll(
      actual: number,
      expected: number,
      test: (
        actual: number | string | bigint | BigNumberEthers | BigNumberJs | BN,
        expected: number | string | bigint | BigNumberEthers | BigNumberJs | BN
      ) => void
    ) {
      const conversions = [
        (n: number) => n,
        (n: number) => n.toString(),
        ...numberToBigNumberConversions,
      ];
      for (const convertActual of conversions) {
        for (const convertExpected of conversions) {
          const convertedActual = convertActual(actual);
          const convertedExpected = convertExpected(expected);
          // a few particular combinations of types don't work:
          if (
            typeof convertedActual === "string" &&
            !BigNumberEthers.isBigNumber(convertedExpected) &&
            !BN.isBN(convertedExpected) &&
            !BigNumberJs.isBigNumber(convertedExpected)
          ) {
            continue;
          }
          if (
            typeof convertedActual === "number" &&
            typeof convertedExpected === "string"
          ) {
            continue;
          }
          test(convertedActual, convertedExpected);
        }
      }
    }

    interface TestCase {
      operator:
        | "equal"
        | "eq"
        | "above"
        | "below"
        | "gt"
        | "lt"
        | "least"
        | "most"
        | "gte"
        | "lte";
      positiveSuccessOperands: [number, number];
      positiveFailureOperands: [number, number];
      positiveFailureMessage: string;
      negativeSuccessOperands: [number, number];
      negativeFailureOperands: [number, number];
      negativeFailureMessage: string;
    }
    const equalsTestCase: Omit<TestCase, "operator"> = {
      positiveSuccessOperands: [10, 10],
      positiveFailureOperands: [10, 11],
      positiveFailureMessage: "expected 10 to equal 11",
      negativeSuccessOperands: [11, 10],
      negativeFailureOperands: [10, 10],
      negativeFailureMessage: "expected 10 to not equal 10",
    };
    const abovePartialTestCase: Omit<
      TestCase,
      "operator" | "negativeSuccessOperands"
    > = {
      positiveSuccessOperands: [10, 9],
      positiveFailureOperands: [10, 10],
      positiveFailureMessage: "expected 10 to be above 10",
      negativeFailureOperands: [11, 10],
      negativeFailureMessage: "expected 11 to be at most 10",
    };
    const aboveTestCase1: Omit<TestCase, "operator"> = {
      ...abovePartialTestCase,
      negativeSuccessOperands: [10, 10],
    };
    const aboveTestCase2: Omit<TestCase, "operator"> = {
      ...abovePartialTestCase,
      negativeSuccessOperands: [10, 11],
    };
    const belowPartialTestCase: Omit<
      TestCase,
      "operator" | "negativeSuccessOperands"
    > = {
      positiveSuccessOperands: [10, 11],
      positiveFailureOperands: [11, 10],
      positiveFailureMessage: "expected 11 to be below 10",
      negativeFailureOperands: [10, 11],
      negativeFailureMessage: "expected 10 to be at least 11",
    };
    const belowTestCase1: Omit<TestCase, "operator"> = {
      ...belowPartialTestCase,
      negativeSuccessOperands: [10, 10],
    };
    const belowTestCase2: Omit<TestCase, "operator"> = {
      ...belowPartialTestCase,
      negativeSuccessOperands: [10, 9],
    };
    const atLeastPartialTestCase: Omit<
      TestCase,
      "operator" | "positiveSuccessOperands"
    > = {
      positiveFailureOperands: [10, 11],
      positiveFailureMessage: "expected 10 to be at least 11",
      negativeSuccessOperands: [10, 11],
      negativeFailureOperands: [11, 10],
      negativeFailureMessage: "expected 11 to be below 10",
    };
    const atLeastTestCase1: Omit<TestCase, "operator"> = {
      ...atLeastPartialTestCase,
      positiveSuccessOperands: [10, 10],
    };
    const atLeastTestCase2: Omit<TestCase, "operator"> = {
      ...atLeastPartialTestCase,
      positiveSuccessOperands: [10, 9],
    };
    const atMostPartialTestCase: Omit<
      TestCase,
      "operator" | "positiveSuccessOperands"
    > = {
      positiveFailureOperands: [11, 10],
      positiveFailureMessage: "expected 11 to be at most 10",
      negativeSuccessOperands: [10, 9],
      negativeFailureOperands: [10, 11],
      negativeFailureMessage: "expected 10 to be above 11",
    };
    const atMostTestCase1: Omit<TestCase, "operator"> = {
      ...atMostPartialTestCase,
      positiveSuccessOperands: [10, 10],
    };
    const atMostTestCase2: Omit<TestCase, "operator"> = {
      ...atMostPartialTestCase,
      positiveSuccessOperands: [10, 11],
    };
    const testCases: TestCase[] = [
      { operator: "equal", ...equalsTestCase },
      { operator: "eq", ...equalsTestCase },
      { operator: "above", ...aboveTestCase1 },
      { operator: "above", ...aboveTestCase2 },
      { operator: "gt", ...aboveTestCase1 },
      { operator: "gt", ...aboveTestCase2 },
      { operator: "below", ...belowTestCase1 },
      { operator: "below", ...belowTestCase2 },
      { operator: "lt", ...belowTestCase1 },
      { operator: "lt", ...belowTestCase2 },
      { operator: "least", ...atLeastTestCase1 },
      { operator: "least", ...atLeastTestCase2 },
      { operator: "gte", ...atLeastTestCase1 },
      { operator: "gte", ...atLeastTestCase2 },
      { operator: "most", ...atMostTestCase1 },
      { operator: "most", ...atMostTestCase2 },
      { operator: "lte", ...atMostTestCase1 },
      { operator: "lte", ...atMostTestCase2 },
    ];
    for (const {
      operator,
      positiveSuccessOperands,
      positiveFailureOperands,
      positiveFailureMessage,
      negativeSuccessOperands,
      negativeFailureOperands,
      negativeFailureMessage,
    } of testCases) {
      describe(`.to.${operator}`, () => {
        checkAll(
          positiveSuccessOperands[0],
          positiveSuccessOperands[1],
          (a, b) => {
            it(`should work with ${typestr(a)} and ${typestr(b)}`, function () {
              expect(a).to[operator](b);
            });
          }
        );
        describe("should throw the proper message on failure", () => {
          checkAll(
            positiveFailureOperands[0],
            positiveFailureOperands[1],
            (a, b) => {
              it(`with ${typestr(a)} and ${typestr(b)}`, function () {
                expect(() => expect(a).to[operator](b)).to.throw(
                  AssertionError,
                  positiveFailureMessage
                );
              });
            }
          );
        });
        describe("should throw when comparing to a non-integral floating point literal", function () {
          for (const convert of numberToBigNumberConversions) {
            const converted = convert(1);
            it(`with float vs ${typestr(converted)}`, function () {
              expect(() => expect(1.1).to[operator](converted)).to.throw(
                RangeError,
                "The number 1.1 cannot be converted to a BigInt because it is not an integer"
              );
            });
            it(`with ${typestr(converted)} vs float`, function () {
              expect(() => expect(converted).to[operator](1.1)).to.throw(
                RangeError,
                "The number 1.1 cannot be converted to a BigInt because it is not an integer"
              );
            });
          }
        });
      });
      describe(`.not.to.${operator}`, function () {
        checkAll(
          negativeSuccessOperands[0],
          negativeSuccessOperands[1],
          (a, b) => {
            it(`should work with ${typestr(a)} and ${typestr(b)}`, function () {
              expect(a).not.to[operator](b);
            });
          }
        );
        describe("should throw the proper message on failure", () => {
          checkAll(
            negativeFailureOperands[0],
            negativeFailureOperands[1],
            (a, b) => {
              it(`with ${typestr(a)} and ${typestr(b)}`, function () {
                expect(() => expect(a).not.to[operator](b)).to.throw(
                  AssertionError,
                  negativeFailureMessage
                );
              });
            }
          );
        });
      });
    }
  });

  describe("with three arguments", function () {
    function checkAll(
      a: number,
      b: number,
      c: number,
      test: (
        a: number | bigint | BigNumberEthers | BigNumberJs | BN,
        b: number | bigint | BigNumberEthers | BigNumberJs | BN,
        c: number | bigint | BigNumberEthers | BigNumberJs | BN
      ) => void
    ) {
      const conversions = [(n: number) => n, ...numberToBigNumberConversions];
      for (const convertA of conversions) {
        for (const convertB of conversions) {
          for (const convertC of conversions) {
            test(convertA(a), convertB(b), convertC(c));
          }
        }
      }
    }

    describe("within", () => {
      describe(".to.be.within", () => {
        checkAll(100, 99, 101, (a, b, c) => {
          it(`should work with ${typestr(a)}, ${typestr(b)} and ${typestr(
            c
          )}`, function () {
            expect(a).to.be.within(b, c);
          });
        });
        describe("should throw the proper message on failure", () => {
          checkAll(100, 80, 90, (a, b, c) => {
            it(`with ${typestr(a)}, ${typestr(b)} and ${typestr(
              c
            )}`, function () {
              expect(() => expect(a).to.be.within(b, c)).to.throw(
                AssertionError,
                "expected 100 to be within 80..90"
              );
            });
          });
        });
      });

      describe(".not.to.be.within", () => {
        checkAll(100, 101, 102, (a, b, c) => {
          it(`should work with ${typestr(a)}, ${typestr(b)} and ${typestr(
            c
          )}`, function () {
            expect(a).not.to.be.within(b, c);
          });
        });
        checkAll(100, 98, 99, (a, b, c) => {
          it(`should work with ${typestr(a)}, ${typestr(b)} and ${typestr(
            c
          )}`, function () {
            expect(a).not.to.be.within(b, c);
          });
        });
        describe("should throw the proper message on failure", () => {
          checkAll(100, 99, 101, (a, b, c) => {
            it(`with ${typestr(a)}, ${typestr(b)} and ${typestr(
              c
            )}`, function () {
              expect(() => expect(a).not.to.be.within(b, c)).to.throw(
                AssertionError,
                "expected 100 to not be within 99..101"
              );
            });
          });
        });
      });
    });

    describe("closeTo", () => {
      describe(".to.be.closeTo", () => {
        checkAll(100, 101, 10, (a, b, c) => {
          it(`should work with ${typestr(a)}, ${typestr(b)} and ${typestr(
            c
          )}`, function () {
            expect(a).to.be.closeTo(b, c);
          });
        });
        describe("should throw the proper message on failure", () => {
          checkAll(100, 111, 10, (a, b, c) => {
            it(`with ${typestr(a)}, ${typestr(b)} and ${typestr(
              c
            )}`, function () {
              expect(() => expect(a).to.be.closeTo(b, c)).to.throw(
                AssertionError,
                "expected 100 to be close to 111"
              );
            });
          });
        });
      });

      describe(".not.to.be.closeTo", () => {
        checkAll(100, 111, 10, (a, b, c) => {
          it(`should work with ${typestr(a)}, ${typestr(b)} and ${typestr(
            c
          )}`, function () {
            expect(a).to.not.be.closeTo(b, c);
          });
        });
        describe("should throw the proper message on failure", () => {
          checkAll(100, 101, 10, (a, b, c) => {
            it(`with ${typestr(a)}, ${typestr(b)} and ${typestr(
              c
            )}`, function () {
              expect(() => expect(a).not.to.be.closeTo(b, c)).to.throw(
                AssertionError,
                "expected 100 not to be close to 101"
              );
            });
          });
        });
      });
    });
  });
});
