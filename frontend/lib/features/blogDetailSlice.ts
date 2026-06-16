import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Blog } from "@/types/model";

interface BlogDetailState {
  blog: Blog | null;
  open: boolean;
}

const initialState: BlogDetailState = {
  blog: null,
  open: false
};

const blogDetailSlice = createSlice({
  name: "blogDetail",
  initialState,
  reducers: {
    openBlogDetail: (state, action: PayloadAction<Blog>) => {
      state.blog = action.payload;
      state.open = true;
    },
    closeBlogDetail: (state) => {
      state.open = false;
      state.blog = null;
    },
    setBlog: (state, action: PayloadAction<Blog>) => {
      state.blog = action.payload;
    },
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload;
    }
  }
});

export const { openBlogDetail, closeBlogDetail, setBlog, setOpen } = blogDetailSlice.actions;
export default blogDetailSlice.reducer;