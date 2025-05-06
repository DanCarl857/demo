import localFont from "next/font/local";

export const poppinsFont = localFont({
  src: [
    {
      path: "./poppins/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./poppins/Poppins-Bold.ttf",
      weight: "700",
      style: "bold",
    },
    {
      path: "./poppins/Poppins-Black.ttf",
      weight: "900",
      style: "black",
    },
    {
      path: "./poppins/Poppins-SemiBold.ttf",
      weight: "600",
      style: "semi-bold",
    },
    {
      path: "./poppins/Poppins-Medium.ttf",
      weight: "500",
      style: "medium",
    },
    {
      path: "./poppins/Poppins-ExtraBold.ttf",
      weight: "800",
      style: "extra-bold",
    },
  ],
});
