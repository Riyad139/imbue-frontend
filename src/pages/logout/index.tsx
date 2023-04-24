import CustomButton from "@/components/CustomMaterialComponents/Button";
import TextInput from "@/components/CustomMaterialComponents/TextInput";
import { postAPIHeaders } from "@/config";
import { redirect, redirectBack } from "@/utils";
import { Buttons } from "@/utils/helper";
import React, { useEffect, useState } from "react";


const Logout = () => {
  const logout = async () => {
    await fetch(`/api/auth/logout`, {
      headers: postAPIHeaders,
      method: "get",
    });
    await redirect("")
  };


  useEffect(() => {
    void logout();
  }, []);

};

export default Logout;
