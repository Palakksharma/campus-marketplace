import {configureStore} from "@reduxjs/toolkit";

import counterReducer from "../slices/counterSlice.js";
import productReducer from "../slices/productSlice.js";
export const store = configureStore({
reducer:{
      counter:counterReducer,
      product:productReducer,
},
})