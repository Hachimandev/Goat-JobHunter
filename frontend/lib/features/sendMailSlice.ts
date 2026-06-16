import { createSlice } from "@reduxjs/toolkit";
import { useAppSelector } from "@/lib/hooks";

interface SendMailState {
  jobId: number;
}

const initialState: SendMailState = {
  jobId: 0,
};

const sendMailSlice = createSlice({
  name: "sendMail",
  initialState,
  reducers: {
    setJobId: (state, action) => {
      state.jobId = action.payload;
    },
    clearJobId: (state) => {
      state.jobId = 0;
    }
  },
});

export const { setJobId, clearJobId } = sendMailSlice.actions;

export const useSendMailSlice = () => useAppSelector((state) => state.sendMail);

export default sendMailSlice.reducer;
