let data = [
  {
    ceiling: 26600,
    floor: 23200,
    reference: 24500,
    symbol: "CNG",
    top1Khop: [],
    top3Ban: [],
    top3Mua: [],
  },
];

const actionTypes = {
  CHANGE_STOCKS: "CHANGE_STOCKS",
  SET_STOCKS: "SET_STOCKS",
};

export const changeStocks = () => ({
  type: actionTypes.CHANGE_STOCKS,
});

export const setStocks = (stocksData) => ({
  type: actionTypes.SET_STOCKS,
  payload: stocksData,
});

const stocks = (state = data, action) => {
  switch (action.type) {
    case actionTypes.SET_STOCKS:
      state = action.payload;
      return [...state];
    case actionTypes.CHANGE_STOCKS:
      state[0].buy_2 = state[0].buy_2 + 1000;
      return [...state];
    default:
      return state;
  }
};

export default stocks;
