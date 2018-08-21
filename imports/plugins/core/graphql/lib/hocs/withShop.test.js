import React from "react";
import { mount } from "enzyme";
import { MockedProvider } from "react-apollo/test-utils";
import waitForFalseyProp from "/imports/test-utils/helpers/waitForFalseyProp";
import getShop from "../queries/getShop";
import withShop from "./withShop";

const fakeOpaqueShopId = "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==";
const MockComponent = () => <div>Mock</div>;
const TestComponent = withShop(MockComponent);
const mocks = [
  {
    request: {
      query: getShop,
      variables: {
        id: fakeOpaqueShopId
      }
    },
    result: {
      data: {
        shop: {
          _id: "cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==",
          description: null,
          name: "Reaction",
          currency: {
            _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
            code: "USD",
            symbol: "$",
            format: "%s%v",
            scale: null,
            decimal: null,
            thousand: null,
            rate: null,
            enabled: true
          },
          currencies: [
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QUVE",
              code: "AED",
              symbol: "د.إ.",
              format: "%v %s",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QUZO",
              code: "AFN",
              symbol: "؋",
              format: "%v%s",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QUxM",
              code: "ALL",
              symbol: "Lek",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QU1E",
              code: "AMD",
              symbol: "AMD",
              format: "%v %s",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QU5H",
              code: "ANG",
              symbol: "ƒ",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QU9B",
              code: "AOA",
              symbol: "Kz",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QVJT",
              code: "ARS",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QVVE",
              code: "AUD",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QVdH",
              code: "AWG",
              symbol: "ƒ",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QVpO",
              code: "AZN",
              symbol: "₼",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QkFN",
              code: "BAM",
              symbol: "KM",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QkJE",
              code: "BBD",
              symbol: "Bds$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QkRU",
              code: "BDT",
              symbol: "৳",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QkdO",
              code: "BGN",
              symbol: "лв.",
              format: "%v %s",
              scale: null,
              decimal: ".",
              thousand: "'",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QkhE",
              code: "BHD",
              symbol: ".د.ب",
              format: "%v %s",
              scale: 3,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QklG",
              code: "BIF",
              symbol: "$",
              format: "%s%v",
              scale: 0,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Qk1E",
              code: "BMD",
              symbol: "FBu",
              format: "%v %s",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Qk5E",
              code: "BND",
              symbol: "B$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Qk9C",
              code: "BOB",
              symbol: "$b",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QlJM",
              code: "BRL",
              symbol: "R$",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QlNE",
              code: "BSD",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QlRO",
              code: "BTN",
              symbol: "Nu.",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QldQ",
              code: "BWP",
              symbol: "P",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QllS",
              code: "BYR",
              symbol: "p.",
              format: "%s%v",
              scale: 0,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6QlpE",
              code: "BZD",
              symbol: "BZ$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q0FE",
              code: "CAD",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q0RG",
              code: "CDF",
              symbol: "CDF",
              format: "%v %s",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q0hG",
              code: "CHF",
              symbol: "CHF",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q0xQ",
              code: "CLP",
              symbol: "$",
              format: "%s%v",
              scale: 0,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q05Z",
              code: "CNY",
              symbol: "¥",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: true
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q09Q",
              code: "COP",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q1JD",
              code: "CRC",
              symbol: "₡",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q1VD",
              code: "CUC",
              symbol: "CUC$",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q1VQ",
              code: "CUP",
              symbol: "₱",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q1ZF",
              code: "CVE",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Q1pL",
              code: "CZK",
              symbol: "Kč",
              format: "%v%s",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6REpG",
              code: "DJF",
              symbol: "Fdj",
              format: "%v %s",
              scale: 0,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6REtL",
              code: "DKK",
              symbol: "kr",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6RE9Q",
              code: "DOP",
              symbol: "RD$",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6RFpE",
              code: "DZD",
              symbol: "دج",
              format: "%v %s",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: true
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6RUdQ",
              code: "EGP",
              symbol: "£",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: true
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6SU5S",
              code: "INR",
              symbol: "₹",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Tk9L",
              code: "NOK",
              symbol: "kr",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6VVNE",
              code: "USD",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: true
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6RVVS",
              code: "EUR",
              symbol: "€",
              format: "%v %s",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: true
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6RVJO",
              code: "ERN",
              symbol: "ናቕፋ",
              format: "%v %s",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6RVRC",
              code: "ETB",
              symbol: "Br",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6RkpE",
              code: "FJD",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6RktQ",
              code: "FKP",
              symbol: "£",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6R0JQ",
              code: "GBP",
              symbol: "£",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: true
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6R0VM",
              code: "GEL",
              symbol: "GEL",
              format: "%v %s",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6R0hT",
              code: "GHS",
              symbol: "GH¢",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6R0lQ",
              code: "GIP",
              symbol: "£",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6R05G",
              code: "GNF",
              symbol: "FG",
              format: "%v %s",
              scale: 0,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6R1RR",
              code: "GTQ",
              symbol: "Q",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6R1lE",
              code: "GYD",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6SEtE",
              code: "HKD",
              symbol: "HK$",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6SFJL",
              code: "HRK",
              symbol: "kn",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6SFVG",
              code: "HUF",
              symbol: "Ft",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6SURS",
              code: "IDR",
              symbol: "Rp",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6SUxT",
              code: "ILS",
              symbol: "₪",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: true
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6SVNL",
              code: "ISK",
              symbol: "kr",
              format: "%s%v",
              scale: 0,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6SlBZ",
              code: "JPY",
              symbol: "¥",
              format: "%s%v",
              scale: 0,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6S1dE",
              code: "KWD",
              symbol: "ك",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6S1JX",
              code: "KRW",
              symbol: "₩",
              format: "%s%v",
              scale: 0,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6S1pU",
              code: "KZT",
              symbol: "KZT",
              format: "%v %s",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6TUFE",
              code: "MAD",
              symbol: "د.م.",
              format: "%v %s",
              scale: null,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6TU1L",
              code: "MMK",
              symbol: "K",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6TVJP",
              code: "MRO",
              symbol: "UM",
              format: "%v %s",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6TVhO",
              code: "MXN",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6TVlS",
              code: "MYR",
              symbol: "RM",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6TlpE",
              code: "NZD",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6TkdO",
              code: "NGN",
              symbol: "₦",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: true
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6UEhQ",
              code: "PHP",
              symbol: "PHP",
              format: "%s %v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6UExO",
              code: "PLN",
              symbol: "zł",
              format: "%v %s",
              scale: null,
              decimal: ",",
              thousand: " ",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6UUFS",
              code: "QAR",
              symbol: "﷼",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6UlVC",
              code: "RUB",
              symbol: "руб.",
              format: "%v %s",
              scale: 0,
              decimal: ",",
              thousand: " ",
              rate: null,
              enabled: true
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6U0FS",
              code: "SAR",
              symbol: "﷼",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6U0VL",
              code: "SEK",
              symbol: "kr",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6U0dE",
              code: "SGD",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6VEhC",
              code: "THB",
              symbol: "฿",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6VE5E",
              code: "TND",
              symbol: "DT",
              format: "%v %s",
              scale: null,
              decimal: ",",
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6VFdE",
              code: "TWD",
              symbol: "NT$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6VUFI",
              code: "UAH",
              symbol: "₴",
              format: "%s%v",
              scale: null,
              decimal: ",",
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6Vk5E",
              code: "VND",
              symbol: "₫",
              format: "%v %s",
              scale: -2,
              decimal: ",",
              thousand: ".",
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6WEFG",
              code: "XAF",
              symbol: "CFA",
              format: "%v %s",
              scale: 0,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6WENE",
              code: "XCD",
              symbol: "$",
              format: "%s%v",
              scale: null,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            },
            {
              _id: "cmVhY3Rpb24vY3VycmVuY3k6WE9G",
              code: "XOF",
              symbol: "CFA",
              format: "%v %s",
              scale: 0,
              decimal: null,
              thousand: null,
              rate: null,
              enabled: false
            }
          ]
        }
      }
    }
  },
  {
    request: {
      query: getShop,
      variables: {
        id: "fakeId"
      }
    },
    result: {
      data: {
        shop: null
      }
    }
  }
];

test("renders child component with correct shop id", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent id="cmVhY3Rpb24vc2hvcDpKOEJocTN1VHRkZ3daeDNyeg==" />
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoading");

  expect(wrapper.find("MockComponent").prop("shop._id")).toBe(fakeOpaqueShopId);
});

test("doesn't query GraphQL if no shopId is provided", () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent />
    </MockedProvider>
  ));

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("shop")).toBe(undefined);
  expect(mockComponentInstance.prop("isLoading")).toBe(undefined);
});

test("passes shouldSkipGraphql to child component if invalid shop id is provided", async () => {
  const wrapper = mount((
    <MockedProvider mocks={mocks} addTypename={false}>
      <TestComponent id ="fakeId" />
    </MockedProvider>
  ));

  await waitForFalseyProp(wrapper, "MockComponent", "isLoading");

  const mockComponentInstance = wrapper.find("MockComponent");
  expect(mockComponentInstance.prop("shop")).toBe(undefined);
  expect(mockComponentInstance.prop("shouldSkipGraphql")).toBe(true);
});
