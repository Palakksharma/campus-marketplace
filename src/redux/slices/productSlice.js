// import {createSlice} from "@reduxjs/toolkit"


// const productSlice =  createSlice({
//   name: "products",
//   initialState: {
//     data:[],
//     loading: false,
//     error: null,
//   },reducers :{},

//   extraReducers : (builder) =>{
//     builder.addCase(fetchProducts.pending, (state) =>{
//         state.loading = true,
//     })

//     .addCase(fetchProducts.fulfilled,(state, action) =>{
//         state.loading = false;
//         state.data = action.payload;
//     })
//     .addCase(fetchProducts.rejected, (state,action) =>{
//         state.error = action.error.message;
//     })
//   }



// })
// export default productSlice.reducer
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../api/apiClient";

// 1. Asynchronous Thunk to fetch data from your Express backend
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      // Points directly to your product routes on the backend port
      const response = await apiClient.get("/products/get-all");
      
      // Your MongoDB structure returns the product array inside response.data.data
      return response.data.data; 
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// 2. The Products Slice Configuration
const productSlice = createSlice({
  name: "products",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {}, // Standard synchronous operations go here if needed

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null; // Reset errors when a new fetch request starts
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Saves the backend products array cleanly into Redux
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default productSlice.reducer;